export type NigeriaLocationKind = "city" | "landmark"

export interface NigeriaLocation {
  id: string
  label: string
  address: string
  city: string
  lat: number
  lng: number
  kind: NigeriaLocationKind
  region: string
}

export const NIGERIA_LOCATIONS: NigeriaLocation[] = [
  {
    id: "city-lagos",
    label: "Lagos",
    address: "Lagos State, Nigeria",
    city: "Lagos",
    lat: 6.5244,
    lng: 3.3792,
    kind: "city",
    region: "Southwest",
  },
  {
    id: "city-ibadan",
    label: "Ibadan",
    address: "Oyo State, Nigeria",
    city: "Ibadan",
    lat: 7.3775,
    lng: 3.947,
    kind: "city",
    region: "Southwest",
  },
  {
    id: "city-abeokuta",
    label: "Abeokuta",
    address: "Ogun State, Nigeria",
    city: "Abeokuta",
    lat: 7.1608,
    lng: 3.3515,
    kind: "city",
    region: "Southwest",
  },
  {
    id: "city-abuja",
    label: "Abuja",
    address: "Federal Capital Territory, Nigeria",
    city: "Abuja",
    lat: 9.0765,
    lng: 7.3986,
    kind: "city",
    region: "North Central",
  },
  {
    id: "city-kano",
    label: "Kano",
    address: "Kano State, Nigeria",
    city: "Kano",
    lat: 12.0022,
    lng: 8.592,
    kind: "city",
    region: "North",
  },
  {
    id: "city-kaduna",
    label: "Kaduna",
    address: "Kaduna State, Nigeria",
    city: "Kaduna",
    lat: 10.5105,
    lng: 7.4165,
    kind: "city",
    region: "North",
  },
  {
    id: "city-jos",
    label: "Jos",
    address: "Plateau State, Nigeria",
    city: "Jos",
    lat: 9.8965,
    lng: 8.8583,
    kind: "city",
    region: "North",
  },
  {
    id: "city-port-harcourt",
    label: "Port Harcourt",
    address: "Rivers State, Nigeria",
    city: "Port Harcourt",
    lat: 4.8156,
    lng: 7.0498,
    kind: "city",
    region: "South-South",
  },
  {
    id: "city-warri",
    label: "Warri",
    address: "Delta State, Nigeria",
    city: "Warri",
    lat: 5.516,
    lng: 5.75,
    kind: "city",
    region: "South-South",
  },
  {
    id: "city-benin",
    label: "Benin City",
    address: "Edo State, Nigeria",
    city: "Benin City",
    lat: 6.335,
    lng: 5.6037,
    kind: "city",
    region: "South-South",
  },
  {
    id: "city-enugu",
    label: "Enugu",
    address: "Enugu State, Nigeria",
    city: "Enugu",
    lat: 6.4402,
    lng: 7.4943,
    kind: "city",
    region: "Southeast",
  },
  {
    id: "city-owerri",
    label: "Owerri",
    address: "Imo State, Nigeria",
    city: "Owerri",
    lat: 5.4836,
    lng: 7.0333,
    kind: "city",
    region: "Southeast",
  },
  {
    id: "landmark-eiffel-ng",
    label: "National Theatre Lagos",
    address: "Iganmu, Lagos",
    city: "Lagos",
    lat: 6.4698,
    lng: 3.3696,
    kind: "landmark",
    region: "Southwest",
  },
  {
    id: "landmark-millennium-abuja",
    label: "Millennium Park Abuja",
    address: "Central Area, Abuja",
    city: "Abuja",
    lat: 9.0659,
    lng: 7.4898,
    kind: "landmark",
    region: "North Central",
  },
]

export function searchNigeriaLocations(query: string): NigeriaLocation[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  return NIGERIA_LOCATIONS.filter(
    (location) =>
      location.label.toLowerCase().includes(normalized) ||
      location.city.toLowerCase().includes(normalized) ||
      location.region.toLowerCase().includes(normalized) ||
      location.address.toLowerCase().includes(normalized),
  )
}
