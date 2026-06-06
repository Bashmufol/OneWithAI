import { Component, type ErrorInfo, type ReactNode } from "react"

interface MapLayerErrorBoundaryProps {
  children: ReactNode
  layerName?: string
  fallback?: ReactNode
}

interface MapLayerErrorBoundaryState {
  hasError: boolean
}

export class MapLayerErrorBoundary extends Component<
  MapLayerErrorBoundaryProps,
  MapLayerErrorBoundaryState
> {
  state: MapLayerErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): MapLayerErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(
      `[MapLayer${this.props.layerName ? `: ${this.props.layerName}` : ""}]`,
      error,
      info.componentStack,
    )
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }

    return this.props.children
  }
}
