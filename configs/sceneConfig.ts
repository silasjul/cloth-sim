export type SceneConfig = {
  exposure: number;
  envIntensity: number;
  bgIntensity: number;
  bgBlur: number;
  envRotation: number;
};

export const SCENE_DEFAULTS: SceneConfig = {
  exposure: 1.75,
  envIntensity: 0.45,
  bgIntensity: 0.4,
  bgBlur: 0,
  envRotation: 0,
};
