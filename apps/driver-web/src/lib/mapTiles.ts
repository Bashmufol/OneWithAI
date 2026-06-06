export type MapStyle = "standard" | "dark" | "satellite"

export interface MapTileConfig {
  label: string
  url: string
  attribution: string
}

export const MAP_STYLE_OPTIONS: { value: MapStyle; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "dark", label: "Dark" },
  { value: "satellite", label: "Satellite" },
]

export const MAP_TILE_CONFIGS: Record<MapStyle, MapTileConfig> = {
  standard: {
    label: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
  dark: {
    label: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
}

export function getMapTileConfig(style: MapStyle): MapTileConfig {
  return MAP_TILE_CONFIGS[style]
}
