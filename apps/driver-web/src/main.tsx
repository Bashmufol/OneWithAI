import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

import { App } from "./app/App"
import { getSettingsSnapshot } from "./lib/settingsStore"
import { useLocationStore } from "./store/locationStore"
import { syncNetworkStateFromNavigator } from "./store/networkStore"
import "./index.css"

useLocationStore.getState().hydrateFromStorage()
syncNetworkStateFromNavigator()

function applySettingsAttributes() {
  const settings = getSettingsSnapshot()
  document.documentElement.dataset.uiMode = settings.uiMode
  document.documentElement.dataset.reduceMotion = settings.reduceMotion
    ? "true"
    : "false"
}

applySettingsAttributes()

async function enableMocking() {
  if (import.meta.env.VITE_API_MODE === "live" || !import.meta.env.DEV) {
    return
  }

  const { worker } = await import("./app/mocks/browser")
  return worker.start({ onUnhandledRequest: "bypass" })
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
