import { useEffect, useRef, type RefObject } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { ClothGrid } from '@/lib/cloth/physics';

const scratchCamDir = new THREE.Vector3();

type DragState = {
  index: number;
  wasPinned: number;
  plane: THREE.Plane;
  point: THREE.Vector3;
};

export function useClothDrag(
  clothRef: RefObject<ClothGrid | null>,
  onDragChange: (dragging: boolean) => void
) {
  const camera = useThree((s) => s.camera);
  const get = useThree((s) => s.get);
  const drag = useRef<DragState | null>(null);

  // disabling via React state is one render too late — OrbitControls sees the
  // pointerdown synchronously, so it must be switched off in the same tick
  const setControlsEnabled = (enabled: boolean) => {
    const controls = get().controls as { enabled: boolean } | null;
    if (controls) controls.enabled = enabled;
  };

  useEffect(() => () => void (document.body.style.cursor = 'auto'), []);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    const cloth = clothRef.current;
    if (!e.face || !cloth) return;
    if (e.face.a >= cloth.count || e.face.b >= cloth.count || e.face.c >= cloth.count) return;
    e.stopPropagation();
    const { pos, pinned } = cloth;
    let best = e.face.a;
    let bestDist = Infinity;
    for (const v of [e.face.a, e.face.b, e.face.c]) {
      const k = v * 3;
      const dx = pos[k] - e.point.x;
      const dy = pos[k + 1] - e.point.y;
      const dz = pos[k + 2] - e.point.z;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bestDist) {
        bestDist = d;
        best = v;
      }
    }
    camera.getWorldDirection(scratchCamDir);
    drag.current = {
      index: best,
      wasPinned: pinned[best],
      plane: new THREE.Plane().setFromNormalAndCoplanarPoint(scratchCamDir, e.point),
      point: e.point.clone(),
    };
    pinned[best] = 1;
    setControlsEnabled(false);
    onDragChange(true);
    document.body.style.cursor = 'grabbing';
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current;
    const cloth = clothRef.current;
    if (!d || !cloth || d.index >= cloth.count) return;
    if (!e.ray.intersectPlane(d.plane, d.point)) return;
    const k = d.index * 3;
    cloth.pos[k] = cloth.prev[k] = d.point.x;
    cloth.pos[k + 1] = cloth.prev[k + 1] = d.point.y;
    cloth.pos[k + 2] = cloth.prev[k + 2] = d.point.z;
    cloth.vel[k] = cloth.vel[k + 1] = cloth.vel[k + 2] = 0;
  };

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current;
    const cloth = clothRef.current;
    if (!d || !cloth) return;
    if (d.index < cloth.count) cloth.pinned[d.index] = d.wasPinned;
    drag.current = null;
    setControlsEnabled(true);
    onDragChange(false);
    document.body.style.cursor = 'grab';
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onLostPointerCapture: onPointerUp,
    onPointerOver: () => {
      if (!drag.current) document.body.style.cursor = 'grab';
    },
    onPointerOut: () => {
      if (!drag.current) document.body.style.cursor = 'auto';
    },
  };
}
