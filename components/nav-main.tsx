"use client"

import { type LucideIcon, Plus } from "lucide-react"
import Link from "next/link"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CreateFormDialog } from "@/components/create-form-dialog"

export function NavMain({
  items,
  createDialogOpen,
  onCreateDialogChange,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
  createDialogOpen?: boolean
  onCreateDialogChange?: (open: boolean) => void
}) {
  return (
    <SidebarMenu>
      {/* Create Form Button */}
      {createDialogOpen !== undefined && onCreateDialogChange && (
        <SidebarMenuItem>
          <CreateFormDialog
            open={createDialogOpen}
            onOpenChange={onCreateDialogChange}
            asMenuItem
          />
        </SidebarMenuItem>
      )}

      {/* Regular Nav Items */}
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={item.isActive}>
            <Link href={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
