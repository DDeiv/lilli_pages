'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Version for state migration - increment when structure changes
const STATE_VERSION = 3;

export const useSceneStore = create(
  persist(
    (set) => ({
      // Camera lock state (prevents all camera movement)
      // Starts unlocked so user can look around immediately
      cameraLocked: false,
      setCameraLocked: (locked) => set({ cameraLocked: locked }),

      // Dialogue window visibility (starts hidden, shown after intro animation)
      showDialogue: false,
      setShowDialogue: (show) => set({ showDialogue: show }),

      // Scroll block overlay (shows before dialogue during animation)
      showScrollBlock: false,
      setShowScrollBlock: (show) => set({ showScrollBlock: show }),

      // Camera position, rotation, and scroll offset (for restoring state when returning from portfolio)
      cameraPosition: null,
      cameraRotation: null,
      scrollOffset: null,
      setCameraState: (position, rotation, scrollOffset) => set({
        cameraPosition: position,
        cameraRotation: rotation,
        scrollOffset: scrollOffset,
      }),

      // Reset all state (useful for testing or "back" button)
      reset: () => set({
        cameraLocked: false,
        showDialogue: false,
        showScrollBlock: false,
        cameraPosition: null,
        cameraRotation: null,
        scrollOffset: null,
      }),
    }),
    {
      name: 'gallery-state',
      version: STATE_VERSION,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        cameraPosition: state.cameraPosition,
        cameraRotation: state.cameraRotation,
        scrollOffset: state.scrollOffset,
      }),
      // Migrate or clear old data
      migrate: (persistedState, version) => {
        if (version !== STATE_VERSION) {
          console.log('🔄 Clearing old session data due to version mismatch');
          return {
            cameraPosition: null,
            cameraRotation: null,
            scrollOffset: null,
          };
        }
        return persistedState;
      },
    }
  )
)
