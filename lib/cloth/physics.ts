import type { ClothConfig } from '@/configs/clothConfig';
import type { PhysicsConfig } from '@/configs/physicsConfig';
import type { WindConfig } from '@/configs/windConfig';

export const TOP_Y = 1.85;
export const STEP = 1 / 60;
const SUBSTEPS = 5;
const H = STEP / SUBSTEPS;

export type ClothGrid = {
  count: number;
  pos: Float32Array;
  prev: Float32Array;
  pinned: Uint8Array;
  sa: Uint32Array;
  sb: Uint32Array;
  srest: Float32Array;
  ba: Uint32Array;
  bb: Uint32Array;
  brest: Float32Array;
};

export function buildCloth(shape: ClothConfig): ClothGrid {
  const nx = Math.round(shape.segmentsX);
  const ny = Math.round(shape.segmentsY);
  const cols = nx + 1;
  const rows = ny + 1;
  const count = cols * rows;

  const pos = new Float32Array(count * 3);
  const prev = new Float32Array(count * 3);
  const pinned = new Uint8Array(count);

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = (j * cols + i) * 3;
      pos[k] = -shape.width / 2 + (i * shape.width) / nx;
      pos[k + 1] = TOP_Y - (j * shape.height) / ny;
      pos[k + 2] = Math.sin(i * 0.7 + j * 0.5) * 0.004;
    }
  }
  prev.set(pos);

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
      }
      if (i < nx - 1) add(ba, bb, brest, a, a + 2);
      if (j < ny - 1) add(ba, bb, brest, a, a + 2 * cols);
    }
  }

  return {
    count,
    pos,
    prev,
    pinned,
    sa: Uint32Array.from(sa),
    sb: Uint32Array.from(sb),
    srest: Float32Array.from(srest),
    ba: Uint32Array.from(ba),
    bb: Uint32Array.from(bb),
    brest: Float32Array.from(brest),
  };
}

function solveConstraints(
  pos: Float32Array,
  pinned: Uint8Array,
  ia: Uint32Array,
  ib: Uint32Array,
  rest: Float32Array,
  strength: number
) {
  for (let c = 0; c < ia.length; c++) {
    const a = ia[c];
    const b = ib[c];
    const pa = pinned[a];
    const pb = pinned[b];
    if (pa && pb) continue;
    const ka = a * 3;
    const kb = b * 3;
    const dx = pos[kb] - pos[ka];
    const dy = pos[kb + 1] - pos[ka + 1];
    const dz = pos[kb + 2] - pos[ka + 2];
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d === 0) continue;
    const diff = ((d - rest[c]) / d) * strength;
    const wa = pa ? 0 : pb ? 1 : 0.5;
    const wb = pb ? 0 : pa ? 1 : 0.5;
    pos[ka] += dx * diff * wa;
    pos[ka + 1] += dy * diff * wa;
    pos[ka + 2] += dz * diff * wa;
    pos[kb] -= dx * diff * wb;
    pos[kb + 1] -= dy * diff * wb;
    pos[kb + 2] -= dz * diff * wb;
  }
}

export function stepCloth(
  cloth: ClothGrid,
  physics: PhysicsConfig,
  wind: WindConfig,
  normals: Float32Array | null,
  startTime: number
): number {
  const { count, pos, prev, pinned, sa, sb, srest, ba, bb, brest } = cloth;
  const { gravity, damping, stiffness, bend } = physics;

  const dirRad = (wind.direction * Math.PI) / 180;
  const wdx = Math.sin(dirRad);
  const wdz = Math.cos(dirRad);
  const keep = 1 - damping;
  const h2 = H * H;

  let t = startTime;
  for (let s = 0; s < SUBSTEPS; s++) {
    t += H;

    const gustNoise =
      0.5 + 0.3 * Math.sin(t * 1.9) + 0.15 * Math.sin(t * 4.1 + 1.7) + 0.05 * Math.sin(t * 9.7 + 3.1);
    const windAmp = wind.strength * (1 + wind.gustiness * (gustNoise * 2 - 1));

    for (let p = 0; p < count; p++) {
      if (pinned[p]) continue;
      const k = p * 3;
      const x = pos[k];
      const y = pos[k + 1];
      const z = pos[k + 2];

      let ax = 0;
      let ay = -gravity;
      let az = 0;
      if (normals && windAmp !== 0) {
        const flutter = 0.75 + 0.25 * Math.sin(x * 4.0 + y * 3.0 + t * 8.0);
        const push = (normals[k] * wdx + normals[k + 2] * wdz) * windAmp * flutter;
        ax += normals[k] * push;
        ay += normals[k + 1] * push;
        az += normals[k + 2] * push;
      }

      const vx = (x - prev[k]) * keep;
      const vy = (y - prev[k + 1]) * keep;
      const vz = (z - prev[k + 2]) * keep;
      prev[k] = x;
      prev[k + 1] = y;
      prev[k + 2] = z;
      pos[k] = x + vx + ax * h2;
      pos[k + 1] = y + vy + ay * h2;
      pos[k + 2] = z + vz + az * h2;
    }

    for (let it = 0; it < stiffness; it++) {
      solveConstraints(pos, pinned, sa, sb, srest, 1);
      if (bend > 0) solveConstraints(pos, pinned, ba, bb, brest, bend);
    }
  }

  return t;
}
