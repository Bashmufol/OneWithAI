import { createBrowserRouter } from "react-router-dom"

import { GlobalErrorBoundary } from "@/components/errors/GlobalErrorBoundary"
import { RouteErrorFallback } from "@/components/errors/RouteErrorFallback"
import { RequireLocation } from "@/components/location/RequireLocation"
import { AppShell } from "@/layouts/AppShell"
import { lazyRoute } from "@/lib/lazyRoute"
import { NotFoundPage } from "@/pages/NotFoundPage"

const MapPage = lazyRoute(() => import("@/pages/MapPage"), "MapPage")
const StationDetailPage = lazyRoute(
  () => import("@/pages/StationDetailPage"),
  "StationDetailPage",
)
const NearMePage = lazyRoute(() => import("@/pages/NearMePage"), "NearMePage")
const EvoScorePage = lazyRoute(
  () => import("@/pages/EvoScorePage"),
  "EvoScorePage",
)
const AdvisorPage = lazyRoute(
  () => import("@/pages/AdvisorPage"),
  "AdvisorPage",
)
const NetworkPage = lazyRoute(
  () => import("@/pages/NetworkPage"),
  "NetworkPage",
)
const SettingsPage = lazyRoute(
  () => import("@/pages/SettingsPage"),
  "SettingsPage",
)
const NotificationsPage = lazyRoute(
  () => import("@/pages/NotificationsPage"),
  "NotificationsPage",
)

export const router = createBrowserRouter([
  {
    element: (
      <GlobalErrorBoundary>
        <AppShell />
      </GlobalErrorBoundary>
    ),
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <MapPage /> },
      { path: "stations/:id", element: <StationDetailPage /> },
      {
        path: "near-me",
        element: (
          <RequireLocation source="near-me">
            <NearMePage />
          </RequireLocation>
        ),
      },
      { path: "evo-score", element: <EvoScorePage /> },
      { path: "advisor", element: <AdvisorPage /> },
      { path: "network", element: <NetworkPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
