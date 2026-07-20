'use client'

import { useRef } from 'react'
import type * as THREE from 'three'
import { useLevaStore } from '@/stores/levaStore'
import ClothMaterial from './ClothMaterial'
import { useClothSim } from './useClothSim'
import { useClothDrag } from './useClothDrag'

export default function Cloth({
  onDragChange,
}: {
  onDragChange: (dragging: boolean) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const shape = useLevaStore((s) => s.cloth)
  const clothRef = useClothSim(meshRef)
  const dragHandlers = useClothDrag(clothRef, onDragChange)

  return (
    <mesh ref={meshRef} {...dragHandlers}>
      <planeGeometry args={[shape.width, shape.height, shape.segmentsX, shape.segmentsY]} />
      <ClothMaterial />
    </mesh>
  )
}
