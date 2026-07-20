import { useEffect } from 'react';
import { useControls } from 'leva';
import { SCENE_DEFAULTS } from '@/configs/sceneConfig';
import { useLevaStore } from '@/stores/levaStore';

export function useSceneTweaks() {
  const setConfig = useLevaStore((s) => s.setScene);

  const { exposure, envIntensity, bgIntensity, bgBlur, envRotation } = useControls(
    'Scene',
    {
      exposure: { value: SCENE_DEFAULTS.exposure, min: 0.1, max: 5, step: 0.05 },
      envIntensity: {
        value: SCENE_DEFAULTS.envIntensity,
        min: 0,
        max: 4,
        step: 0.05,
        label: 'env light',
      },
      bgIntensity: {
        value: SCENE_DEFAULTS.bgIntensity,
        min: 0,
        max: 4,
        step: 0.05,
        label: 'bg brightness',
      },
      bgBlur: { value: SCENE_DEFAULTS.bgBlur, min: 0, max: 1, step: 0.01, label: 'bg blur' },
      envRotation: {
        value: SCENE_DEFAULTS.envRotation,
        min: 0,
        max: 360,
        step: 1,
        label: 'rotation',
      },
    },
    { collapsed: true }
  );

  useEffect(() => {
    setConfig({ exposure, envIntensity, bgIntensity, bgBlur, envRotation });
  }, [setConfig, exposure, envIntensity, bgIntensity, bgBlur, envRotation]);
}
