import { useEffect } from 'react';
import { useControls } from 'leva';
import { CLOTH_DEFAULTS } from '@/configs/clothConfig';
import { useLevaStore } from '@/stores/levaStore';

export function useClothTweaks() {
  const setConfig = useLevaStore((s) => s.setCloth);

  const { width, height, segmentsX, segmentsY, pins } = useControls(
    'Cloth',
    {
      width: { value: CLOTH_DEFAULTS.width, min: 0.5, max: 4, step: 0.1 },
      height: { value: CLOTH_DEFAULTS.height, min: 0.5, max: 3, step: 0.05 },
      segmentsX: { value: CLOTH_DEFAULTS.segmentsX, min: 8, max: 80, step: 1, label: 'segments X' },
      segmentsY: { value: CLOTH_DEFAULTS.segmentsY, min: 8, max: 60, step: 1, label: 'segments Y' },
      pins: { value: CLOTH_DEFAULTS.pins, min: 2, max: 12, step: 1 },
    },
    { collapsed: true }
  );

  useEffect(() => {
    setConfig({ width, height, segmentsX, segmentsY, pins });
  }, [setConfig, width, height, segmentsX, segmentsY, pins]);
}
