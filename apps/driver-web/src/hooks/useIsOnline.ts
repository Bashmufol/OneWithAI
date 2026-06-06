import { useNetworkStore } from "@/store/networkStore"

export function useIsOnline(): boolean {
  return useNetworkStore((state) => state.isOnline)
}
