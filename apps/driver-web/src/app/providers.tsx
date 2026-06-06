import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { NuqsAdapter } from "nuqs/adapters/react-router/v7"

import { LocationBootstrap } from "@/components/location/LocationBootstrap"
import { NavigationBootstrap } from "@/components/navigation/NavigationBootstrap"
import { LocationPermissionHost } from "@/components/location/LocationPermissionHost"
import { NotificationEventBridge } from "@/components/notifications/NotificationEventBridge"
import { NetworkBootstrap } from "@/components/network/NetworkBootstrap"
import { NetworkSimulationRunner } from "@/components/network/NetworkSimulationRunner"
import { SettingsRuntime } from "@/components/settings/SettingsRuntime"
import { TooltipProvider } from "@/components/ui/tooltip"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <TooltipProvider delayDuration={300}>
          <SettingsRuntime />
          <NetworkBootstrap />
          <LocationBootstrap />
          <NavigationBootstrap />
          <LocationPermissionHost />
          <NotificationEventBridge />
          <NetworkSimulationRunner />
          {children}
        </TooltipProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  )
}
