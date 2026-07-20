import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { useLevaStore } from '@/stores/levaStore';
import { buildCloth, stepCloth, STEP, type ClothGrid } from '@/lib/cloth/physics';

export function useClothSim(meshRef: RefObject<THREE.Mesh | null>) {
  const clothRef = useRef<ClothGrid | null>(null);
  const buildKey = useRef('');
  const timeAcc = useRef(0);
  const simTime = useRef(0);

  useFrame((_, delta) => {
    const { cloth: shape, physics, wind } = useLevaStore.getState();

    const key = [shape.width, shape.height, shape.segmentsX, shape.segmentsY, shape.pins].join('|');
    if (!clothRef.current || buildKey.current !== key) {
      clothRef.current = buildCloth(shape);
      buildKey.current = key;
    }
    const cloth = clothRef.current;

    const geom = meshRef.current!.geometry;

    timeAcc.current = Math.min(timeAcc.current + delta, STEP * 3);
    while (timeAcc.current >= STEP - 1e-9) {
      timeAcc.current -= STEP;
      simTime.current = stepCloth(cloth, physics, wind, simTime.current);
    }

    const attr = geom.attributes.position as THREE.BufferAttribute;
    if (attr.count !== cloth.count) return;
    (attr.array as Float32Array).set(cloth.pos);
    attr.needsUpdate = true;
    geom.computeVertexNormals();
    geom.computeBoundingSphere();
  });

  return clothRef;
}
