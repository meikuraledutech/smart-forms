"use client"

import * as React from "react"
import {
  Command,
  FileText,
  BarChart3,
  CreditCard,
  Settings2,
  MessageCircleQuestion,
  Plus,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { TeamSwitcher } from "@/components/team-switcher"
import { CreateFormDialog } from "@/components/create-form-dialog"
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
      logo: Command,
      plan: "Free",
    }
  ],
  navMain: [
    {
      title: "My Forms",
      url: "/dashboard",
      icon: FileText,
      isActive: true,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavMain
          items={data.navMain}
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
