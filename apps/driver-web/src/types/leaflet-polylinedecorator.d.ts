import "leaflet"

declare module "leaflet" {
  namespace Symbol {
    function arrowHead(options?: {
      pixelSize?: number
      polygon?: boolean
      pathOptions?: PathOptions
    }): Symbol
  }

  function polylineDecorator(
    paths: LatLngExpression[] | LatLngExpression[][] | Polyline,
    options: {
      patterns: Array<{
        offset?: number | string
        repeat?: number | string
        symbol: Symbol
      }>
    },
  ): Layer
}

export {}
