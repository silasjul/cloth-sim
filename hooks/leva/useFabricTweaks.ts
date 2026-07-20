import { useEffect } from 'react';
import { useControls } from 'leva';
import { FABRIC_DEFAULTS } from '@/configs/fabricConfig';
import { CLOTH_PRESETS, type ClothPresetId } from '@/configs/clothPresets';
import { useLevaStore } from '@/stores/levaStore';

const presetOptions = Object.fromEntries(
  Object.entries(CLOTH_PRESETS).map(([id, p]) => [p.label, id])
) as Record<string, ClothPresetId>;

export function useFabricTweaks() {
  const setConfig = useLevaStore((s) => s.setFabric);

  const { preset, color } = useControls(
    'Fabric',
    {
      preset: { value: FABRIC_DEFAULTS.preset as ClothPresetId, options: presetOptions },
      color: { value: FABRIC_DEFAULTS.color, label: 'tint' },
    },
    { collapsed: true }
  );

  useEffect(() => {
    setConfig({ preset: preset as ClothPresetId, color });
  }, [setConfig, preset, color]);
}
