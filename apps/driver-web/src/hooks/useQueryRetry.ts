import { useCallback, useState } from "react"

interface RefetchLike {
  (): Promise<unknown>
}

export function useQueryRetry(refetch: RefetchLike) {
  const [isRetrying, setIsRetrying] = useState(false)

  const onRetry = useCallback(async () => {
    setIsRetrying(true)
    try {
      await refetch()
    } finally {
      setIsRetrying(false)
    }
  }, [refetch])

  return {
    onRetry,
    isRetrying,
  }
}
