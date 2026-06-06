import { create } from "zustand"

export type LocationTriggerSource = "near-me" | "map" | "manual" | null

interface LocationUIStore {
  isPermissionModalOpen: boolean
  triggerSource: LocationTriggerSource
  allowFallbackAccess: boolean
  openPermissionModal: (source: LocationTriggerSource) => void
  closePermissionModal: () => void
  enableFallbackAccess: () => void
}

export const useLocationUIStore = create<LocationUIStore>((set) => ({
  isPermissionModalOpen: false,
  triggerSource: null,
  allowFallbackAccess: false,

  openPermissionModal: (triggerSource) =>
    set({ isPermissionModalOpen: true, triggerSource }),

  closePermissionModal: () =>
    set({ isPermissionModalOpen: false, triggerSource: null }),

  enableFallbackAccess: () => set({ allowFallbackAccess: true }),
}))
