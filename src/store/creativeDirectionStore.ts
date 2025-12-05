/**
 * Creative Direction Store
 *
 * Zustand store for managing creative direction state with persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CreativeDirectionState, CreativeDirectionStoreState } from '../types/creativeDirection';

const DEFAULT_STATE: CreativeDirectionState = {
    trustSquad: false,
    vision: '',
    uploadedFiles: [],
    fileDescriptions: {},
};

export const useCreativeDirectionStore = create<CreativeDirectionStoreState>()(
    persist(
        (set) => ({
            creativeDirectionState: DEFAULT_STATE,

            updateCreativeDirectionState: (updates) =>
                set((state) => ({
                    creativeDirectionState: {
                        ...state.creativeDirectionState,
                        ...updates,
                    },
                })),

            resetCreativeDirectionState: () =>
                set({
                    creativeDirectionState: DEFAULT_STATE,
                }),

            setCreativeDirectionState: (newState) =>
                set({
                    creativeDirectionState: newState,
                }),
        }),
        {
            name: 'prf-creative-direction-store',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
