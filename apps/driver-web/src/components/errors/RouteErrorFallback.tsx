import { useCallback, useState } from "react"
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

import { ErrorFallbackShell } from "@/components/errors/ErrorFallbackShell"
import { FRIENDLY_ERROR, FRIENDLY_NOT_FOUND, logAppError } from "@/lib/errorUtils"

export function RouteErrorFallback() {
  const error = useRouteError()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isRetrying, setIsRetrying] = useState(false)
  const [errorId] = useState(() => logAppError("RouteErrorFallback", error))

  const isNotFound =
    isRouteErrorResponse(error) &&
    (error.status === 404 || error.statusText === "Not Found")

  const title = isNotFound ? FRIENDLY_NOT_FOUND.title : FRIENDLY_ERROR.title
  const description = isNotFound
    ? FRIENDLY_NOT_FOUND.description
    : FRIENDLY_ERROR.description

  const handleRetry = useCallback(async () => {
    setIsRetrying(true)

    try {
      await queryClient.invalidateQueries()
      navigate(".", { replace: true })
    } catch {
      window.location.assign(window.location.pathname)
    } finally {
      window.setTimeout(() => setIsRetrying(false), 350)
    }
  }, [navigate, queryClient])

  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate("/")
  }, [navigate])

  return (
    <ErrorFallbackShell
      title={title}
      description={description}
      errorId={errorId}
      isRetrying={isRetrying}
      onRetry={handleRetry}
      onGoBack={handleGoBack}
      primaryAction={
        isNotFound
          ? { label: "Go to Stations", to: "/" }
          : undefined
      }
    />
  )
}
