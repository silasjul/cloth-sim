'use client'

import { Suspense, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { ReinhardToneMapping } from 'three'
import Cloth from '@/components/cloth/Cloth'
import { useLevaStore } from '@/stores/levaStore'

function Exposure() {
  useFrame(({ gl }) => {
    gl.toneMappingExposure = useLevaStore.getState().scene.exposure
  })

  return null
}

export default function Scene() {
  const [dragging, setDragging] = useState(false)
  const scene = useLevaStore((s) => s.scene)
  const rotation = (scene.envRotation * Math.PI) / 180

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ toneMapping: ReinhardToneMapping }}
      camera={{ position: [0.85, 1.32, 3.45], fov: 40 }}
    >
      <Exposure />

      <Suspense fallback={null}>
        <Environment
          files="/valley_of_desolation_4k.hdr"
          background
          environmentIntensity={scene.envIntensity}
          backgroundIntensity={scene.bgIntensity}
          backgroundBlurriness={scene.bgBlur}
          environmentRotation={[0, rotation, 0]}
          backgroundRotation={[0, rotation, 0]}
        />
        <Cloth onDragChange={setDragging} />
      </Suspense>

      <OrbitControls
        makeDefault
        enabled={!dragging}
        target={[0, 1.2, 0]}
        minDistance={1.2}
        maxDistance={5}
      />
    </Canvas>
  )
}
