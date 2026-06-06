import { RouterProvider } from "react-router-dom"

import { GlobalErrorBoundary } from "@/components/errors/GlobalErrorBoundary"
import { Providers } from "./providers"
import { router } from "./router"

export function App() {
  return (
    <GlobalErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </GlobalErrorBoundary>
  )
}
