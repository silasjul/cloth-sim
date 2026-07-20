import { useEffect } from 'react';
import { useControls } from 'leva';
import { PHYSICS_DEFAULTS } from '@/configs/physicsConfig';
import { CLOTH_PRESETS } from '@/configs/clothPresets';
import { useLevaStore } from '@/stores/levaStore';

export function usePhysicsTweaks() {
  const setConfig = useLevaStore((s) => s.setPhysics);
  const presetId = useLevaStore((s) => s.fabric.preset);

  const [values, set] = useControls(
    'Physics',
    () => ({
      weight: { value: PHYSICS_DEFAULTS.weight, min: 0.05, max: 1.5, step: 0.01, label: 'weight (kg/m²)' },
      stiffness: { value: PHYSICS_DEFAULTS.stiffness, min: 0, max: 1, step: 0.01 },
      bend: { value: PHYSICS_DEFAULTS.bend, min: 0, max: 1, step: 0.01, label: 'bend stiffness' },
      drag: { value: PHYSICS_DEFAULTS.drag, min: 0, max: 1, step: 0.01, label: 'air drag' },
    }),
    { collapsed: true }
  );

  useEffect(() => {
    set({ ...CLOTH_PRESETS[presetId].physics });
  }, [presetId, set]);

  useEffect(() => {
    setConfig(values);
  }, [setConfig, values]);
}
