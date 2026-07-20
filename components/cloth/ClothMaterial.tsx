'use client'

import { useEffect, useState } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useLevaStore } from '@/stores/levaStore'
import { CLOTH_PRESETS, type ClothMaps, type ClothPresetId } from '@/configs/clothPresets'

const PRESET_IDS = Object.keys(CLOTH_PRESETS) as ClothPresetId[]

const TEXTURE_ENTRIES = PRESET_IDS.flatMap((id) =>
  (Object.entries(CLOTH_PRESETS[id].maps) as [keyof ClothMaps, string][]).map(([key, url]) => ({
    presetId: id,
    key,
    url,
  }))
)

const TEXTURE_URLS = TEXTURE_ENTRIES.map((e) => e.url)

function createMaterials(textures: THREE.Texture[]) {
  const texByUrl = new Map<string, THREE.Texture>()
  textures.forEach((tex, i) => {
    const { presetId, key, url } = TEXTURE_ENTRIES[i]
    const preset = CLOTH_PRESETS[presetId]
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(preset.repeat[0], preset.repeat[1])
    tex.anisotropy = 8
    if (key === 'color') tex.colorSpace = THREE.SRGBColorSpace
    tex.needsUpdate = true
    texByUrl.set(url, tex)
  })

  return Object.fromEntries(
    PRESET_IDS.map((id) => {
      const p = CLOTH_PRESETS[id]
      const t = (key: keyof ClothMaps) => (p.maps[key] ? texByUrl.get(p.maps[key]) : undefined)
      const arm = t('arm')
      const alpha = t('alpha')
      const normalScale = p.normalScale ?? 1
      const mat = new THREE.MeshPhysicalMaterial({
        color: p.baseColor ?? '#ffffff',
        map: t('color'),
        roughnessMap: arm,
        metalnessMap: arm,
        metalness: arm ? 1 : 0,
        roughness: p.roughness,
        normalMap: t('normal'),
        normalScale: new THREE.Vector2(normalScale, normalScale),
        bumpMap: t('bump'),
        bumpScale: p.bumpScale ?? 0,
        alphaMap: alpha,
        alphaTest: alpha ? 0.5 : 0,
        sheen: p.sheen,
        sheenRoughness: p.sheenRoughness,
        sheenColor: p.sheenColor,
        clearcoat: p.clearcoat ?? 0,
        clearcoatRoughness: p.clearcoatRoughness ?? 0.5,
        side: THREE.DoubleSide,
      })
      return [id, mat]
    })
  ) as Record<ClothPresetId, THREE.MeshPhysicalMaterial>
}

export default function ClothMaterial() {
  const { preset: presetId, color } = useLevaStore((s) => s.fabric)

  const textures = useTexture(TEXTURE_URLS)
  const [materials] = useState(() => createMaterials(textures))

  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials])

  const active = materials[presetId]

  useEffect(() => {
    active.color
      .set(CLOTH_PRESETS[presetId].baseColor ?? '#ffffff')
      .multiply(new THREE.Color(color))
  }, [active, presetId, color])

  return (
    <>
      <primitive object={active} attach="material" />
      {/* off-screen quads keep every preset's shader compiled so switching never stalls */}
      <group position={[0, 0, 30]}>
        {PRESET_IDS.map((id) => (
          <mesh key={id} frustumCulled={false} raycast={() => null} material={materials[id]}>
            <planeGeometry args={[0.001, 0.001]} />
          </mesh>
        ))}
      </group>
    </>
  )
}
