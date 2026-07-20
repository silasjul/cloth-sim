import type { ClothPresetId } from './clothPresets';

export type FabricConfig = {
  preset: ClothPresetId;
  color: string;
};

export const FABRIC_DEFAULTS: FabricConfig = {
  preset: 'gingham',
  color: '#ffffff',
};
