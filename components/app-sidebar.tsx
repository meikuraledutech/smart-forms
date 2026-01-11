"use client"

import * as React from "react"
import {
  Command,
  FileText,
  BarChart3,
  Settings2,
  MessageCircleQuestion,
  Plus,
  Users,
  DollarSign,
  Tag,
  LayoutTemplate,
  Ticket,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { TeamSwitcher } from "@/components/team-switcher"
import { CreateFormDialog } from "@/components/create-form-dialog"
import { useAuthStore } from "@/lib/auth-store"
import { SmartFormsIcon } from "@/components/smart-forms-icon"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  teams: [
    {
      name: "Smart Forms",
      logo: SmartFormsIcon,
      plan: "Free",
    }
  ],
  navMain: [
    {
      title: "My Forms",
      url: "/dashboard",
      icon: FileText,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
  ],
  adminNavItems: [
    {
      title: "Templates",
      url: "/dashboard/templates",
      icon: LayoutTemplate,
    },
    {
      title: "Pricing",
      url: "/dashboard/pricing",
      icon: Tag,
    },
    {
      title: "Tickets",
      url: "/dashboard/tickets",
      icon: Ticket,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: Users,
    },
    {
      title: "Revenue",
      url: "/dashboard/revenue",
      icon: DollarSign,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
}

export function AppSidebar({
  activeItem,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeItem?: string
}) {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const user = useAuthStore((s) => s.user)

  // Combine nav items based on user role
  const allNavItems = React.useMemo(() => {
    const baseItems = [...data.navMain]

    // Add admin items if user is super_admin
    if (user?.role === "super_admin") {
      return [...baseItems, ...data.adminNavItems]
    }

    return baseItems
  }, [user?.role])

  // Update items to set active based on prop
  const navMainWithActive = allNavItems.map(item => ({
    ...item,
    isActive: item.title === activeItem
  }))

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavMain
          items={navMainWithActive}
          createDialogOpen={createDialogOpen}
          onCreateDialogChange={setCreateDialogOpen}
        />
      </SidebarHeader>
      <SidebarContent>
        {/* Bottom navigation - commented for later use */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
