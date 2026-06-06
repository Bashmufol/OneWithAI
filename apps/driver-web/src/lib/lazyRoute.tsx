import { lazy, Suspense, type ComponentType } from "react"

import { GlobalErrorBoundary } from "@/components/errors/GlobalErrorBoundary"
import { LoadingState } from "@/components/ui/LoadingState"

export function lazyRoute<T extends Record<string, ComponentType<object>>>(
  importer: () => Promise<T>,
  exportName: keyof T,
) {
  const LazyPage = lazy(() =>
    importer().then((module) => ({
      default: module[exportName] as ComponentType<object>,
    })),
  )

  return function LazyRoutePage() {
    return (
      <GlobalErrorBoundary compact>
        <Suspense fallback={<LoadingState className="min-h-[40vh]" />}>
          <LazyPage />
        </Suspense>
      </GlobalErrorBoundary>
    )
  }
}
