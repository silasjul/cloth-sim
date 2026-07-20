export type ClothConfig = {
  width: number;
  height: number;
  segmentsX: number;
  segmentsY: number;
  pins: number;
};

export const CLOTH_DEFAULTS: ClothConfig = {
  width: 1.8,
  height: 1.25,
  segmentsX: 48,
  segmentsY: 34,
  pins: 5,
};
