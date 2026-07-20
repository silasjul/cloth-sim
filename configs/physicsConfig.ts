import { CLOTH_PRESETS } from './clothPresets';

export type PhysicsConfig = {
  weight: number;
  stiffness: number;
  bend: number;
  drag: number;
};

export const PHYSICS_DEFAULTS: PhysicsConfig = { ...CLOTH_PRESETS.gingham.physics };
