import { ErrorFallbackShell } from "@/components/errors/ErrorFallbackShell"
import { FRIENDLY_NOT_FOUND } from "@/lib/errorUtils"
import { useNavigate } from "react-router-dom"

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <ErrorFallbackShell
      title={FRIENDLY_NOT_FOUND.title}
      description={FRIENDLY_NOT_FOUND.description}
      onGoBack={() => {
        if (window.history.length > 1) {
          navigate(-1)
          return
        }
        navigate("/")
      }}
      primaryAction={{ label: "Go to Stations", to: "/" }}
      compact
      className="min-h-[min(520px,70vh)]"
    />
  )
}
