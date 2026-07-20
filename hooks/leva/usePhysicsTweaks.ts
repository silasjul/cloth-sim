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
      gravity: { value: PHYSICS_DEFAULTS.gravity, min: 0, max: 25, step: 0.1 },
      damping: { value: PHYSICS_DEFAULTS.damping, min: 0, max: 0.05, step: 0.001 },
      stiffness: { value: PHYSICS_DEFAULTS.stiffness, min: 1, max: 20, step: 1 },
      bend: { value: PHYSICS_DEFAULTS.bend, min: 0, max: 1, step: 0.05, label: 'bend stiffness' },
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
