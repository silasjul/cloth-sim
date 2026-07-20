'use client'

import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useLevaStore } from '@/stores/levaStore'
import { CLOTH_PRESETS, type ClothMaps } from '@/configs/clothPresets'

export default function ClothMaterial() {
  const { preset: presetId, color } = useLevaStore((s) => s.fabric)
  const preset = CLOTH_PRESETS[presetId]

  const entries = useMemo(
    () => Object.entries(preset.maps) as [keyof ClothMaps, string][],
    [preset]
  )

  const loaded = useTexture(
    entries.map(([, url]) => url),
    (textures) => {
      const list = Array.isArray(textures) ? textures : [textures]
      list.forEach((tex, i) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(preset.repeat[0], preset.repeat[1])
        tex.anisotropy = 8
        if (entries[i][0] === 'color') tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true
      })
    }
  )

  const tex = useMemo(() => {
    const byKey: Partial<Record<keyof ClothMaps, THREE.Texture>> = {}
    entries.forEach(([key], i) => {
      byKey[key] = loaded[i]
    })
    return byKey
  }, [entries, loaded])

  const matColor = useMemo(
    () => new THREE.Color(preset.baseColor ?? '#ffffff').multiply(new THREE.Color(color)),
    [preset, color]
  )

  return (
    <meshPhysicalMaterial
      key={presetId}
      color={matColor}
      map={tex.color}
      roughnessMap={tex.arm}
      metalnessMap={tex.arm}
      metalness={tex.arm ? 1 : 0}
      roughness={preset.roughness}
      normalMap={tex.normal}
      normalScale={preset.normalScale ?? 1}
      bumpMap={tex.bump}
      bumpScale={preset.bumpScale ?? 0}
      alphaMap={tex.alpha}
      alphaTest={tex.alpha ? 0.5 : 0}
      sheen={preset.sheen}
      sheenRoughness={preset.sheenRoughness}
      sheenColor={preset.sheenColor}
      clearcoat={preset.clearcoat ?? 0}
      clearcoatRoughness={preset.clearcoatRoughness ?? 0.5}
      side={THREE.DoubleSide}
    />
  )
}
