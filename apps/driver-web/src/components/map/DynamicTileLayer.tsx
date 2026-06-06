import { TileLayer } from "react-leaflet"

import { getMapTileConfig } from "@/lib/mapTiles"
import { useMapStyleStore } from "@/store/mapStyleStore"

export function DynamicTileLayer() {
  const mapStyle = useMapStyleStore((state) => state.currentMapStyle)
  const config = getMapTileConfig(mapStyle)

  return (
    <TileLayer
      key={mapStyle}
      url={config.url}
      attribution={config.attribution}
    />
  )
}
