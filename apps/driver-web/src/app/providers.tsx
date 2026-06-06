import { NuqsAdapter } from "nuqs/adapters/react-router/v7"
import { QueryClientProvider } from "@tanstack/react-query"

import { AppBootstrap } from "@/components/AppBootstrap"
import { LocationBootstrap } from "@/components/location/LocationBootstrap"
import { NavigationBootstrap } from "@/components/navigation/NavigationBootstrap"
import { LocationPermissionHost } from "@/components/location/LocationPermissionHost"
import { NotificationEventBridge } from "@/components/notifications/NotificationEventBridge"
import { NetworkBootstrap } from "@/components/network/NetworkBootstrap"
import { NetworkSimulationRunner } from "@/components/network/NetworkSimulationRunner"
import { SettingsRuntime } from "@/components/settings/SettingsRuntime"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getQueryClient } from "@/lib/queryClient"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <NuqsAdapter>
        <TooltipProvider delayDuration={300}>
          <AppBootstrap />
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
