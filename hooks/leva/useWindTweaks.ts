import { useEffect } from 'react';
import { useControls } from 'leva';
import { WIND_DEFAULTS } from '@/configs/windConfig';
import { CLOTH_PRESETS } from '@/configs/clothPresets';
import { useLevaStore } from '@/stores/levaStore';

export function useWindTweaks() {
  const setConfig = useLevaStore((s) => s.setWind);
  const presetId = useLevaStore((s) => s.fabric.preset);

  const [values, set] = useControls(
    'Wind',
    () => ({
      strength: { value: WIND_DEFAULTS.strength, min: 0, max: 15, step: 0.1 },
      direction: { value: WIND_DEFAULTS.direction, min: 0, max: 360, step: 1 },
      gustiness: { value: WIND_DEFAULTS.gustiness, min: 0, max: 1, step: 0.05 },
    }),
    { collapsed: true }
  );

  useEffect(() => {
    set({ ...CLOTH_PRESETS[presetId].wind });
  }, [presetId, set]);

  useEffect(() => {
    setConfig(values);
  }, [setConfig, values]);
}
