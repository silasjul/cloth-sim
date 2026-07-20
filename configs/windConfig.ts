import { CLOTH_PRESETS } from './clothPresets';

export type WindConfig = {
  strength: number;
  direction: number;
  gustiness: number;
};

export const WIND_DEFAULTS: WindConfig = { ...CLOTH_PRESETS.gingham.wind };
