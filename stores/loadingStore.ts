import { create } from 'zustand';

/**
 * image  — waiting for loading.png, scene not mounted yet
 * assets — loading screen visible, scene mounted and loading
 * reveal — fade-out + camera intro running
 * done   — overlay gone, Leva visible
 */
export type LoadingPhase = 'image' | 'assets' | 'reveal' | 'done';

interface LoadingState {
  phase: LoadingPhase;
  setPhase: (phase: LoadingPhase) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  phase: 'image',
  setPhase: (phase) => set({ phase }),
}));
