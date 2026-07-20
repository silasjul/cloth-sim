'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'
import { useLoadingStore } from '@/stores/loadingStore'

export default function Loader() {
  const phase = useLoadingStore((s) => s.phase)
  const setPhase = useLoadingStore((s) => s.setPhase)
  const { progress, active } = useProgress()
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phase !== 'assets' || active || progress !== 100) return
    // loaders can briefly report "done" between queued files — wait for it to stay settled
    const settle = setTimeout(() => setPhase('reveal'), 400)
    return () => clearTimeout(settle)
  }, [phase, active, progress, setPhase])

  useEffect(() => {
    if (phase !== 'reveal') return
    const tween = gsap.to(overlayRef.current, {
      autoAlpha: 0,
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete: () => setPhase('done'),
    })
    return () => {
      tween.kill()
    }
  }, [phase, setPhase])

  if (phase === 'done') return null

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 select-none ${phase === 'reveal' ? 'pointer-events-none' : ''}`}
    >
      <Image
        src="/loading.png"
        alt="Loading"
        fill
        priority
        sizes="100vw"
        className="object-cover"
        onLoad={() => {
          if (useLoadingStore.getState().phase === 'image') setPhase('assets')
        }}
      />
    </div>
  )
}
