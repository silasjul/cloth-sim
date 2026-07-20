import type { ClothConfig } from '@/configs/clothConfig';
import type { PhysicsConfig } from '@/configs/physicsConfig';
import type { WindConfig } from '@/configs/windConfig';

export const TOP_Y = 1.85;
export const STEP = 1 / 60;
const SUBSTEPS = 15;
// one Gauss-Seidel pass per substep goes unstable on the over-constrained
// quad grid (period-2 jitter); two passes are stable at any compliance
const ITERATIONS = 2;
const H = STEP / SUBSTEPS;
const GRAVITY = 9.81;
const AERO = 0.6; // 0.5 * air density * drag coefficient
// caps the constraint-solve whip when a dragged vertex is yanked, well above any wind-driven speed
const MAX_SPEED = 20;

export type ClothGrid = {
  count: number;
  pos: Float32Array;
  prev: Float32Array;
  vel: Float32Array;
  force: Float32Array;
  pinned: Uint8Array;
  invArea: number;
  sa: Uint32Array;
  sb: Uint32Array;
  srest: Float32Array;
  ba: Uint32Array;
  bb: Uint32Array;
  brest: Float32Array;
  fa: Uint32Array;
  fb: Uint32Array;
  frest: Float32Array;
  tri: Uint32Array;
};

// span of the compression-only flatness constraints: short 2-apart bend pairs can't
// see smooth curls (a rolled tube compresses them ~4%), a 6-apart chord collapses
const SPREAD = 6;

export function buildCloth(shape: ClothConfig): ClothGrid {
  const nx = Math.round(shape.segmentsX);
  const ny = Math.round(shape.segmentsY);
  const cols = nx + 1;
  const rows = ny + 1;
  const count = cols * rows;

  const pos = new Float32Array(count * 3);
  const pinned = new Uint8Array(count);

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = (j * cols + i) * 3;
      pos[k] = -shape.width / 2 + (i * shape.width) / nx;
      pos[k + 1] = TOP_Y - (j * shape.height) / ny;
      pos[k + 2] = Math.sin(i * 0.7 + j * 0.5) * 0.004;
    }
  }
  const prev = Float32Array.from(pos);

  const pinCount = Math.max(2, Math.round(shape.pins));
  for (let p = 0; p < pinCount; p++) {
    pinned[Math.round((p * nx) / (pinCount - 1))] = 1;
  }

  const sa: number[] = [];
  const sb: number[] = [];
  const srest: number[] = [];
  const ba: number[] = [];
  const bb: number[] = [];
  const brest: number[] = [];
  const fa: number[] = [];
  const fb: number[] = [];
  const frest: number[] = [];
  const tri: number[] = [];
  const add = (ia: number[], ib: number[], rest: number[], a: number, b: number) => {
    const ka = a * 3;
    const kb = b * 3;
    ia.push(a);
    ib.push(b);
    rest.push(
      Math.hypot(pos[kb] - pos[ka], pos[kb + 1] - pos[ka + 1], pos[kb + 2] - pos[ka + 2])
    );
  };
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = j * cols + i;
      if (i < nx) add(sa, sb, srest, a, a + 1);
      if (j < ny) add(sa, sb, srest, a, a + cols);
      if (i < nx && j < ny) {
        add(sa, sb, srest, a, a + cols + 1);
        add(sa, sb, srest, a + 1, a + cols);
        tri.push(a, a + cols, a + 1, a + 1, a + cols, a + cols + 1);
      }
      if (i < nx - 1) add(ba, bb, brest, a, a + 2);
      if (j < ny - 1) add(ba, bb, brest, a, a + 2 * cols);
      if (i + SPREAD <= nx) add(fa, fb, frest, a, a + SPREAD);
      if (j + SPREAD <= ny) add(fa, fb, frest, a, a + SPREAD * cols);
    }
  }

  return {
    count,
    pos,
    prev,
    vel: new Float32Array(count * 3),
    force: new Float32Array(count * 3),
    pinned,
    invArea: count / (shape.width * shape.height),
    sa: Uint32Array.from(sa),
    sb: Uint32Array.from(sb),
    srest: Float32Array.from(srest),
    ba: Uint32Array.from(ba),
    bb: Uint32Array.from(bb),
    brest: Float32Array.from(brest),
    fa: Uint32Array.from(fa),
    fb: Uint32Array.from(fb),
    frest: Float32Array.from(frest),
    tri: Uint32Array.from(tri),
  };
}

function solveDistance(
  pos: Float32Array,
  pinned: Uint8Array,
  ia: Uint32Array,
  ib: Uint32Array,
  rest: Float32Array,
  alphaTilde: number,
  compressOnly = false
) {
  for (let c = 0; c < ia.length; c++) {
    const a = ia[c];
    const b = ib[c];
    const wa = pinned[a] ? 0 : 1;
    const wb = pinned[b] ? 0 : 1;
    const wSum = wa + wb;
    if (wSum === 0) continue;
    const ka = a * 3;
    const kb = b * 3;
    const dx = pos[kb] - pos[ka];
    const dy = pos[kb + 1] - pos[ka + 1];
    const dz = pos[kb + 2] - pos[ka + 2];
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d === 0) continue;
    if (compressOnly && d >= rest[c]) continue;
    const s = (d - rest[c]) / ((wSum + alphaTilde) * d);
    pos[ka] += dx * s * wa;
    pos[ka + 1] += dy * s * wa;
    pos[ka + 2] += dz * s * wa;
    pos[kb] -= dx * s * wb;
    pos[kb + 1] -= dy * s * wb;
    pos[kb + 2] -= dz * s * wb;
  }
}

function applyWind(
  cloth: ClothGrid,
  wdx: number,
  wdz: number,
  windAmp: number,
  t: number
) {
  const { pos, vel, force, tri } = cloth;
  for (let k = 0; k < tri.length; k += 3) {
    const ka = tri[k] * 3;
    const kb = tri[k + 1] * 3;
    const kc = tri[k + 2] * 3;

    const e1x = pos[kb] - pos[ka];
    const e1y = pos[kb + 1] - pos[ka + 1];
    const e1z = pos[kb + 2] - pos[ka + 2];
    const e2x = pos[kc] - pos[ka];
    const e2y = pos[kc + 1] - pos[ka + 1];
    const e2z = pos[kc + 2] - pos[ka + 2];

    let nx = e1y * e2z - e1z * e2y;
    let ny = e1z * e2x - e1x * e2z;
    let nz = e1x * e2y - e1y * e2x;
    const ln = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (ln < 1e-12) continue;
    const area = ln * 0.5;
    nx /= ln;
    ny /= ln;
    nz /= ln;

    const px = (pos[ka] + pos[kb] + pos[kc]) / 3;
    const py = (pos[ka + 1] + pos[kb + 1] + pos[kc + 1]) / 3;
    const flutter = 0.75 + 0.25 * Math.sin(px * 4.0 + py * 3.0 + t * 8.0);

    const rx = wdx * windAmp * flutter - (vel[ka] + vel[kb] + vel[kc]) / 3;
    const ry = -(vel[ka + 1] + vel[kb + 1] + vel[kc + 1]) / 3;
    const rz = wdz * windAmp * flutter - (vel[ka + 2] + vel[kb + 2] + vel[kc + 2]) / 3;

    const q = nx * rx + ny * ry + nz * rz;
    const speed = Math.sqrt(rx * rx + ry * ry + rz * rz);
    const f = (AERO * area * q * speed) / 3;

    force[ka] += nx * f;
    force[ka + 1] += ny * f;
    force[ka + 2] += nz * f;
    force[kb] += nx * f;
    force[kb + 1] += ny * f;
    force[kb + 2] += nz * f;
    force[kc] += nx * f;
    force[kc + 1] += ny * f;
    force[kc + 2] += nz * f;
  }
}

export function stepCloth(
  cloth: ClothGrid,
  physics: PhysicsConfig,
  wind: WindConfig,
  startTime: number
): number {
  const { count, pos, prev, vel, force, pinned, invArea, sa, sb, srest, ba, bb, brest, fa, fb, frest } =
    cloth;
  const { weight, stiffness, bend, drag } = physics;

  const invMass = invArea / Math.max(weight, 0.01);
  const h2 = H * H;
  const alphaStretch = (1e-8 + (1 - stiffness) ** 3 * 5e-5) / h2;
  const alphaBend = (1e-7 + (1 - bend) ** 2 * 3e-5) / h2;
  const alphaFlat = (5e-7 + (1 - bend) ** 2 * 1e-4) / h2;
  const dragKeep = Math.exp(-H * (0.1 + drag * 6));

  const dirRad = (wind.direction * Math.PI) / 180;
  const wdx = Math.sin(dirRad);
  const wdz = Math.cos(dirRad);

  let t = startTime;
  for (let s = 0; s < SUBSTEPS; s++) {
    t += H;

    const gustNoise =
      0.5 + 0.3 * Math.sin(t * 1.9) + 0.15 * Math.sin(t * 4.1 + 1.7) + 0.05 * Math.sin(t * 9.7 + 3.1);
    const windAmp = wind.strength * (1 + wind.gustiness * (gustNoise * 2 - 1));

    force.fill(0);
    if (windAmp !== 0) applyWind(cloth, wdx, wdz, windAmp, t);

    for (let p = 0; p < count; p++) {
      if (pinned[p]) continue;
      const k = p * 3;
      vel[k] = (vel[k] + force[k] * invMass * H) * dragKeep;
      vel[k + 1] = (vel[k + 1] + (force[k + 1] * invMass - GRAVITY) * H) * dragKeep;
      vel[k + 2] = (vel[k + 2] + force[k + 2] * invMass * H) * dragKeep;
      prev[k] = pos[k];
      prev[k + 1] = pos[k + 1];
      prev[k + 2] = pos[k + 2];
      pos[k] += vel[k] * H;
      pos[k + 1] += vel[k + 1] * H;
      pos[k + 2] += vel[k + 2] * H;
    }

    for (let it = 0; it < ITERATIONS; it++) {
      solveDistance(pos, pinned, sa, sb, srest, alphaStretch);
      solveDistance(pos, pinned, ba, bb, brest, alphaBend);
      solveDistance(pos, pinned, fa, fb, frest, alphaFlat, true);
    }

    for (let p = 0; p < count; p++) {
      if (pinned[p]) continue;
      const k = p * 3;
      let vx = (pos[k] - prev[k]) / H;
      let vy = (pos[k + 1] - prev[k + 1]) / H;
      let vz = (pos[k + 2] - prev[k + 2]) / H;
      const sp = Math.sqrt(vx * vx + vy * vy + vz * vz);
      if (sp > MAX_SPEED) {
        const sc = MAX_SPEED / sp;
        vx *= sc;
        vy *= sc;
        vz *= sc;
      }
      vel[k] = vx;
      vel[k + 1] = vy;
      vel[k + 2] = vz;
    }
  }

  return t;
}
