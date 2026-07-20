import { CLOTH_PRESETS } from './clothPresets';

export type PhysicsConfig = {
  gravity: number;
  damping: number;
  stiffness: number;
  bend: number;
};

export const PHYSICS_DEFAULTS: PhysicsConfig = { ...CLOTH_PRESETS.gingham.physics };
