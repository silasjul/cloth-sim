import type { PhysicsConfig } from './physicsConfig';
import type { WindConfig } from './windConfig';

export type ClothMaps = {
  color?: string;
  arm?: string;
  normal?: string;
  bump?: string;
  alpha?: string;
};

export type ClothPreset = {
  label: string;
  maps: ClothMaps;
  baseColor?: string;
  repeat: [number, number];
  bumpScale?: number;
  normalScale?: number;
  roughness: number;
  sheen: number;
  sheenRoughness: number;
  sheenColor: string;
  clearcoat?: number;
  clearcoatRoughness?: number;
  physics: PhysicsConfig;
  wind: WindConfig;
};

export type ClothPresetId = 'gingham' | 'satin' | 'hessian' | 'leather';

export const CLOTH_PRESETS: Record<ClothPresetId, ClothPreset> = {
  gingham: {
    label: 'Gingham Cotton',
    maps: {
      color: '/gingham_check_1k/textures/gingham_check_diff_1k.jpg',
      arm: '/gingham_check_1k/textures/gingham_check_arm_1k.jpg',
      bump: '/gingham_check_1k/textures/gingham_check_disp_1k.png',
    },
    repeat: [2, 1.4],
    bumpScale: 0.35,
    roughness: 1,
    sheen: 0.35,
    sheenRoughness: 0.6,
    sheenColor: '#ffffff',
    physics: {
      gravity: 9.81,
      damping: 0.008,
      stiffness: 7,
      bend: 0.35,
    },
    wind: {
      strength: 2.5,
      direction: 25,
      gustiness: 0.65,
    },
  },
  satin: {
    label: 'Crepe Satin',
    maps: {
      color: '/crepe_satin_1k/textures/crepe_satin_diff_1k.jpg',
      arm: '/crepe_satin_1k/textures/crepe_satin_arm_1k.jpg',
      bump: '/crepe_satin_1k/textures/crepe_satin_disp_1k.png',
    },
    repeat: [2, 1.4],
    bumpScale: 0.12,
    roughness: 0.85,
    sheen: 1,
    sheenRoughness: 0.25,
    sheenColor: '#fff4e8',
    physics: {
      gravity: 9.81,
      damping: 0.003,
      stiffness: 9,
      bend: 0.08,
    },
    wind: {
      strength: 3.5,
      direction: 25,
      gustiness: 0.75,
    },
  },
  hessian: {
    label: 'Hessian Burlap',
    maps: {
      color: '/hessian_230_1k/textures/hessian_230_diff_1k.jpg',
      arm: '/hessian_230_1k/textures/hessian_230_arm_1k.jpg',
      normal: '/hessian_230_1k/textures/hessian_230_nor_gl_1k.png',
      bump: '/hessian_230_1k/textures/hessian_230_disp_1k.png',
      alpha: '/hessian_230_1k/textures/hessian_230_mask_1k.png',
    },
    repeat: [2, 1.4],
    bumpScale: 0.3,
    normalScale: 1,
    roughness: 1,
    sheen: 0.15,
    sheenRoughness: 0.9,
    sheenColor: '#e8dcc2',
    physics: {
      gravity: 9.81,
      damping: 0.02,
      stiffness: 10,
      bend: 0.7,
    },
    wind: {
      strength: 1.6,
      direction: 25,
      gustiness: 0.5,
    },
  },
  leather: {
    label: 'Red Leather',
    maps: {
      arm: '/leather_red_02_1k/textures/leather_red_02_arm_1k.jpg',
      normal: '/leather_red_02_1k/textures/leather_red_02_nor_gl_1k.png',
      bump: '/leather_red_02_1k/textures/leather_red_02_disp_1k.png',
    },
    baseColor: '#7a2027',
    repeat: [2, 1.4],
    bumpScale: 0.15,
    normalScale: 1.2,
    roughness: 1,
    sheen: 0,
    sheenRoughness: 1,
    sheenColor: '#ffffff',
    clearcoat: 0.25,
    clearcoatRoughness: 0.45,
    physics: {
      gravity: 9.81,
      damping: 0.03,
      stiffness: 14,
      bend: 1,
    },
    wind: {
      strength: 0.9,
      direction: 25,
      gustiness: 0.3,
    },
  },
};
