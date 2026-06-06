import { createBrowserRouter } from "react-router-dom"

import { RequireLocation } from "@/components/location/RequireLocation"
import { AppShell } from "@/layouts/AppShell"
import { AdvisorPage } from "@/pages/AdvisorPage"
import { EvoScorePage } from "@/pages/EvoScorePage"
import { MapPage } from "@/pages/MapPage"
import { NearMePage } from "@/pages/NearMePage"
import { NetworkPage } from "@/pages/NetworkPage"
import { NotificationsPage } from "@/pages/NotificationsPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { StationDetailPage } from "@/pages/StationDetailPage"

export const router = createBrowserRouter([
  {
    element: <AppShell />,
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
    ],
  },
])
