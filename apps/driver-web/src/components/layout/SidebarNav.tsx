import { NavLink } from "react-router-dom"

import { navItems } from "@/components/layout/navItems"
import { cn } from "@/lib/utils"

interface SidebarNavProps {
  onNavigate?: () => void
  className?: string
}

export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {navItems.map((item) => {
        const Icon = item.icon
        return (
        <NavLink
          key={item.to}
          to={item.to}
          end={"end" in item ? item.end : false}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-elevated text-primary shadow-[0_0_20px_oklch(0.789_0.154_194.769_/_18%)] ring-1 ring-primary/25"
                : "text-muted-foreground hover:bg-elevated/70 hover:text-foreground",
            )
          }
        >
          <Icon className="size-4 shrink-0" />
          {item.label}
        </NavLink>
        )
      })}
    </nav>
  )
}
