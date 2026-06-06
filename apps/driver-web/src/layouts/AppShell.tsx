import {
  Menu,
  Presentation,
  Settings,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { DemoStoryPanel } from "@/components/demo/DemoStoryPanel"
import { NavbarLocationButton } from "@/components/location/NavbarLocationButton"
import { OfflineBanner } from "@/components/network/OfflineBanner"
import { NotificationCenter } from "@/components/notifications/NotificationCenter"
import { AnimatedOutlet } from "@/components/layout/AnimatedOutlet"
import { SidebarNav } from "@/components/layout/SidebarNav"
import { StationSearchInput } from "@/components/stations/StationSearchInput"
import { useSettings } from "@/hooks/useSettings"
import { useNetworkStore } from "@/store/networkStore"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-xs font-semibold tracking-widest text-transparent uppercase">
        EvoCharge
      </span>
      <h1 className="text-lg font-semibold tracking-tight text-foreground">
        Driver
      </h1>
    </div>
  )
}

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { isDemoMode, setDemoMode } = useSettings()
  const isOnline = useNetworkStore((state) => state.isOnline)

  return (
    <div className="flex h-svh bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <div className="border-b border-border px-5 py-5">
          <BrandMark />
        </div>

        <div className="flex flex-1 flex-col p-3">
          <SidebarNav />
        </div>

        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-elevated/50 p-3 ring-1 ring-border/60">
            <p className="text-xs font-medium text-muted-foreground">Device</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className={cn(
                  "size-2 rounded-full",
                  isOnline
                    ? "bg-status-available shadow-[0_0_8px_oklch(0.765_0.177_163.223_/_60%)]"
                    : "bg-status-offline shadow-[0_0_8px_oklch(0.704_0.191_22.216_/_60%)]",
                )}
              />
              <p className="text-sm font-medium">
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 border-border bg-sidebar p-0"
            >
              <SheetHeader className="border-b border-border px-5 py-5 text-left">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <BrandMark />
              </SheetHeader>
              <div className="p-3">
                <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
            <p className="truncate text-sm text-muted-foreground">
              Find and charge across Nigeria
            </p>
            <Badge variant="outline" className="hidden border-border text-brand-violet lg:inline-flex">
              Beta
            </Badge>
            {isDemoMode ? (
              <Badge className="hidden border-brand-violet/30 bg-brand-violet/15 text-brand-violet lg:inline-flex">
                <Presentation className="mr-1 size-3" />
                Demo
              </Badge>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-none md:justify-end">
            <StationSearchInput className="min-w-0 flex-1 md:max-w-xs lg:max-w-sm" />

            <Separator orientation="vertical" className="mx-1 hidden h-6 md:block" />

            <NavbarLocationButton />

            <NotificationCenter />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full ring-1 ring-border/60 transition-shadow hover:shadow-[0_0_16px_oklch(0.789_0.154_194.769_/_15%)]"
                >
                  <Avatar size="sm">
                    <AvatarFallback className="bg-elevated text-xs font-medium text-brand-cyan">
                      EV
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={isDemoMode}
                  onCheckedChange={(checked) => setDemoMode(checked)}
                >
                  <Presentation className="size-4" />
                  Demo Mode
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <OfflineBanner />

        <main className="flex-1 overflow-auto bg-background">
          <AnimatedOutlet />
        </main>
      </div>

      <DemoStoryPanel />
    </div>
  )
}
