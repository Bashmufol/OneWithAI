import { motion } from "framer-motion"
import {
  Bell,
  Gauge,
  Map,
  Monitor,
  Presentation,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from "lucide-react"

import { AnimatedCard } from "@/components/ev/AnimatedCard"
import { PageSection } from "@/components/ev/PageSection"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useSettings } from "@/hooks/useSettings"
import { getNotificationLevelLabel } from "@/lib/notificationFilter"
import { slideUp } from "@/lib/motion"
import { cn } from "@/lib/utils"

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-4 last:border-b-0">
      <div className="min-w-0 space-y-1">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function ModeToggle({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="inline-flex rounded-lg bg-muted/60 p-1 ring-1 ring-border/60">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function SettingsPage() {
  const {
    settings,
    isDemoMode,
    isComfortMode,
    isHeatmapDefault,
    setDemoMode,
    setUIMode,
    setMapMode,
    setAutoEnableHeatmap,
    setNotificationLevel,
    setSimulationSpeed,
    setReduceMotion,
  } = useSettings()

  return (
    <PageSection
      title="Control Center"
      description="Global configuration for simulation speed, map behavior, UI presentation, and notification filtering across EvoCharge."
      badge="Settings"
      badgeVariant="outline"
      className="max-w-5xl"
    >
      <motion.div variants={slideUp} className="md:col-span-2 lg:col-span-3">
        <AnimatedCard
          title="Application Control"
          description="Tune how EvoCharge simulates the network and presents intelligence."
        >
          <Tabs defaultValue="system" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="system">
                <Gauge className="size-3.5" />
                System
              </TabsTrigger>
              <TabsTrigger value="ui">
                <Monitor className="size-3.5" />
                UI
              </TabsTrigger>
              <TabsTrigger value="map">
                <Map className="size-3.5" />
                Map
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="size-3.5" />
                Alerts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="system" className="mt-4">
              <div className="rounded-xl border border-border/60 bg-elevated/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Presentation className="size-4 text-brand-violet" />
                  <h3 className="text-sm font-semibold">System Control</h3>
                  {isDemoMode ? (
                    <Badge className="border-brand-violet/30 bg-brand-violet/15 text-brand-violet">
                      Demo active
                    </Badge>
                  ) : null}
                </div>

                <SettingRow
                  label="Demo Mode"
                  description="Deterministic network pulses for presentations and guided demos."
                >
                  <Switch
                    checked={settings.demoMode}
                    onCheckedChange={setDemoMode}
                    aria-label="Toggle demo mode"
                  />
                </SettingRow>

                <SettingRow
                  label="Simulation Speed"
                  description="Controls how fast station status changes and demand heatmaps refresh."
                >
                  <Select
                    value={settings.liveSimulationSpeed}
                    onValueChange={(value) =>
                      setSimulationSpeed(
                        value as typeof settings.liveSimulationSpeed,
                      )
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
              </div>
            </TabsContent>

            <TabsContent value="ui" className="mt-4">
              <div className="rounded-xl border border-border/60 bg-elevated/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-brand-cyan" />
                  <h3 className="text-sm font-semibold">UI Preferences</h3>
                </div>

                <SettingRow
                  label="UI Mode"
                  description={
                    isComfortMode
                      ? "Comfort — brighter map, stronger card contrast, vivid tooltips."
                      : "Intelligence — subtle analytical surfaces tuned for data density."
                  }
                >
                  <ModeToggle
                    value={settings.uiMode}
                    onChange={(value) => setUIMode(value as typeof settings.uiMode)}
                    options={[
                      { value: "comfort", label: "Comfort" },
                      { value: "intelligence", label: "Intelligence" },
                    ]}
                  />
                </SettingRow>

                <SettingRow
                  label="Reduce Motion"
                  description="Disables Framer Motion transitions and soft marker animations."
                >
                  <Switch
                    checked={settings.reduceMotion}
                    onCheckedChange={setReduceMotion}
                    aria-label="Toggle reduce motion"
                  />
                </SettingRow>
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-4">
              <div className="rounded-xl border border-border/60 bg-elevated/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Map className="size-4 text-brand-cyan" />
                  <h3 className="text-sm font-semibold">Map Preferences</h3>
                  {isHeatmapDefault ? (
                    <Badge variant="outline" className="text-brand-cyan">
                      Heatmap default
                    </Badge>
                  ) : null}
                </div>

                <SettingRow
                  label="Default Map View"
                  description="Choose whether the map opens in standard pin view or heatmap-first."
                >
                  <ModeToggle
                    value={settings.mapMode}
                    onChange={(value) => setMapMode(value as typeof settings.mapMode)}
                    options={[
                      { value: "standard", label: "Standard" },
                      { value: "heatmap-first", label: "Heatmap" },
                    ]}
                  />
                </SettingRow>

                <SettingRow
                  label="Auto-enable Heatmap"
                  description="Automatically overlay demand heatmap when opening the map."
                >
                  <Switch
                    checked={settings.autoEnableHeatmap}
                    onCheckedChange={setAutoEnableHeatmap}
                    aria-label="Toggle auto-enable heatmap"
                  />
                </SettingRow>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-4">
              <div className="rounded-xl border border-border/60 bg-elevated/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Bell className="size-4 text-brand-violet" />
                  <h3 className="text-sm font-semibold">Notifications</h3>
                </div>

                <SettingRow
                  label="Notification Level"
                  description="Filters which network pulse events surface in the notification center (Phase 10.2)."
                >
                  <Select
                    value={settings.notificationLevel}
                    onValueChange={(value) =>
                      setNotificationLevel(
                        value as typeof settings.notificationLevel,
                      )
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All events</SelectItem>
                      <SelectItem value="important">Important only</SelectItem>
                      <SelectItem value="critical">Critical only</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>

                <p className="mt-2 text-xs text-muted-foreground">
                  Current filter:{" "}
                  <span className="font-medium text-foreground">
                    {getNotificationLevelLabel(settings.notificationLevel)}
                  </span>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </AnimatedCard>
      </motion.div>

      <motion.div variants={slideUp}>
        <AnimatedCard
          title="Live Status"
          description="Settings apply instantly across map, network, and advisor surfaces."
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Simulation</span>
              <Badge variant="secondary" className="capitalize">
                {settings.liveSimulationSpeed}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">UI surface</span>
              <Badge variant="secondary" className="capitalize">
                {settings.uiMode}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Map default</span>
              <Badge variant="secondary" className="capitalize">
                {settings.mapMode.replace("-", " ")}
              </Badge>
            </div>
          </div>
        </AnimatedCard>
      </motion.div>

      <motion.div variants={slideUp}>
        <AnimatedCard
          title="Intelligence Layer"
          description="EvoScore, routing, and advisor all respect your global preferences."
        >
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-brand-cyan/10 p-2 ring-1 ring-brand-cyan/20">
              <Sparkles className="size-4 text-brand-cyan" />
            </div>
            <p className="text-sm text-muted-foreground">
              Changes persist locally and rehydrate on reload. Notification
              filtering is wired for the upcoming alerts system.
            </p>
          </div>
        </AnimatedCard>
      </motion.div>

      <motion.div variants={slideUp}>
        <AnimatedCard
          title="Network Engine"
          description="Pulse timing and demand refresh intervals scale with simulation speed."
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="size-4 shrink-0 text-status-available" />
            {isDemoMode
              ? "Demo mode uses deterministic seeds for repeatable storytelling."
              : "Live mode uses organic random transitions across the Lagos network."}
          </div>
        </AnimatedCard>
      </motion.div>
    </PageSection>
  )
}
