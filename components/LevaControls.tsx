'use client';

import { useEffect, useState } from 'react';
import { Leva } from 'leva';
import { useFabricTweaks } from '@/hooks/leva/useFabricTweaks';
import { useClothTweaks } from '@/hooks/leva/useClothTweaks';
import { usePhysicsTweaks } from '@/hooks/leva/usePhysicsTweaks';
import { useWindTweaks } from '@/hooks/leva/useWindTweaks';
import { useSceneTweaks } from '@/hooks/leva/useSceneTweaks';

export default function LevaControls() {
  useFabricTweaks();
  useClothTweaks();
  usePhysicsTweaks();
  useWindTweaks();
  useSceneTweaks();

  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'h') return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      setHidden((prev) => !prev);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return <Leva hidden={hidden} />;
}
