import { create } from 'zustand';
import { FABRIC_DEFAULTS, type FabricConfig } from '@/configs/fabricConfig';
import { CLOTH_DEFAULTS, type ClothConfig } from '@/configs/clothConfig';
import { PHYSICS_DEFAULTS, type PhysicsConfig } from '@/configs/physicsConfig';
import { WIND_DEFAULTS, type WindConfig } from '@/configs/windConfig';
import { SCENE_DEFAULTS, type SceneConfig } from '@/configs/sceneConfig';

interface LevaState {
  fabric: FabricConfig;
  setFabric: (fabric: FabricConfig) => void;
  cloth: ClothConfig;
  setCloth: (cloth: ClothConfig) => void;
  physics: PhysicsConfig;
  setPhysics: (physics: PhysicsConfig) => void;
  wind: WindConfig;
  setWind: (wind: WindConfig) => void;
  scene: SceneConfig;
  setScene: (scene: SceneConfig) => void;
}

export const useLevaStore = create<LevaState>((set) => ({
  fabric: FABRIC_DEFAULTS,
  setFabric: (fabric) => set({ fabric }),
  cloth: CLOTH_DEFAULTS,
  setCloth: (cloth) => set({ cloth }),
  physics: PHYSICS_DEFAULTS,
  setPhysics: (physics) => set({ physics }),
  wind: WIND_DEFAULTS,
  setWind: (wind) => set({ wind }),
  scene: SCENE_DEFAULTS,
  setScene: (scene) => set({ scene }),
}));
