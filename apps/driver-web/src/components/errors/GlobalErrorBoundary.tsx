import { Component, Fragment, type ErrorInfo, type ReactNode } from "react"

import { ErrorFallbackShell } from "@/components/errors/ErrorFallbackShell"
import { FRIENDLY_ERROR, logAppError } from "@/lib/errorUtils"

interface GlobalErrorBoundaryProps {
  children: ReactNode
  /** Smaller layout for nested route/page boundaries */
  compact?: boolean
}

interface GlobalErrorBoundaryState {
  hasError: boolean
  errorId: string | null
  isRetrying: boolean
  retryKey: number
}

export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  state: GlobalErrorBoundaryState = {
    hasError: false,
    errorId: null,
    isRetrying: false,
    retryKey: 0,
  }

  static getDerivedStateFromError(): Partial<GlobalErrorBoundaryState> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const errorId = logAppError("GlobalErrorBoundary", error, {
      componentStack: info.componentStack,
    })
    this.setState({ errorId })
  }

  private handleRetry = () => {
    this.setState({ isRetrying: true })

    window.setTimeout(() => {
      this.setState((state) => ({
        hasError: false,
        errorId: null,
        isRetrying: false,
        retryKey: state.retryKey + 1,
      }))
    }, 350)
  }

  private handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    window.location.assign("/")
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackShell
          title={FRIENDLY_ERROR.title}
          description={FRIENDLY_ERROR.description}
          errorId={this.state.errorId}
          isRetrying={this.state.isRetrying}
          onRetry={this.handleRetry}
          onGoBack={this.handleGoBack}
          compact={this.props.compact}
        />
      )
    }

    return (
      <Fragment key={this.state.retryKey}>{this.props.children}</Fragment>
    )
  }
}
