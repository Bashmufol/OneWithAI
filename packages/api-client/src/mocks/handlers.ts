import { stationListSchema } from "@evocharge/types"
import { http, HttpResponse } from "msw"

import { generateNigeriaStations } from "./generateNigeriaStations"
import type { Station } from "@evocharge/types"

const stations = stationListSchema.parse(generateNigeriaStations(250))

function filterByBounds(
  items: Station[],
  north: number,
  south: number,
  east: number,
  west: number,
) {
  return items.filter(
    (station) =>
      station.location.lat <= north &&
      station.location.lat >= south &&
      station.location.lng <= east &&
      station.location.lng >= west,
  )
}

export const handlers = [
  http.get("/api/stations", ({ request }) => {
    const url = new URL(request.url)
    const north = url.searchParams.get("north")
    const south = url.searchParams.get("south")
    const east = url.searchParams.get("east")
    const west = url.searchParams.get("west")

    if (north && south && east && west) {
      return HttpResponse.json(
        filterByBounds(
          stations,
          Number(north),
          Number(south),
          Number(east),
          Number(west),
        ),
      )
    }

    return HttpResponse.json(stations)
  }),

  http.get("/api/stations/:id", ({ params }) => {
    const station = stations.find((item) => item.id === params.id)

    if (!station) {
      return HttpResponse.json({ message: "Station not found" }, { status: 404 })
    }

    return HttpResponse.json(station)
  }),
]

export { stations as mockStations }
