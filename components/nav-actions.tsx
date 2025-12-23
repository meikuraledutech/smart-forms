"use client"

import * as React from "react"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/auth-store"

import { Button } from "@/components/ui/button"

// Commented out for later use
// import {
//   ArrowDown,
//   ArrowUp,
//   Bell,
//   Copy,
//   CornerUpLeft,
//   CornerUpRight,
//   FileText,
//   GalleryVerticalEnd,
//   LineChart,
//   Link,
//   MoreHorizontal,
//   Settings2,
//   Star,
//   Trash,
//   Trash2,
// } from "lucide-react"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar"

// Commented out dropdown data for later use
// const data = [
//   [
//     {
//       label: "Customize Page",
//       icon: Settings2,
//     },
//     {
//       label: "Turn into wiki",
//       icon: FileText,
//     },
//   ],
//   [
//     {
//       label: "Copy Link",
//       icon: Link,
//     },
//     {
//       label: "Duplicate",
//       icon: Copy,
//     },
//     {
//       label: "Move to",
//       icon: CornerUpRight,
//     },
//     {
//       label: "Move to Trash",
//       icon: Trash2,
//     },
//   ],
//   [
//     {
//       label: "Undo",
//       icon: CornerUpLeft,
//     },
//     {
//       label: "View analytics",
//       icon: LineChart,
//     },
//     {
//       label: "Version History",
//       icon: GalleryVerticalEnd,
//     },
//     {
//       label: "Show delete pages",
//       icon: Trash,
//     },
//     {
//       label: "Notifications",
//       icon: Bell,
//     },
//   ],
//   [
//     {
//       label: "Import",
//       icon: ArrowUp,
//     },
//     {
//       label: "Export",
//       icon: ArrowDown,
//     },
//   ],
// ]

export function NavActions() {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.replace("/login")
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </Button>
    </div>
  )
}

// Commented out dropdown code for later use
// export function NavActions() {
//   const [isOpen, setIsOpen] = React.useState(false)
//
//   // Auto-open dropdown - disabled
//   // React.useEffect(() => {
//   //   setIsOpen(true)
//   // }, [])
//
//   return (
//     <div className="flex items-center gap-2 text-sm">
//       <div className="text-muted-foreground hidden font-medium md:inline-block">
//         Edit Oct 08
//       </div>
//       <Button variant="ghost" size="icon" className="h-7 w-7">
//         <Star />
//       </Button>
//       <Popover open={isOpen} onOpenChange={setIsOpen}>
//         <PopoverTrigger asChild>
//           <Button
//             variant="ghost"
//             size="icon"
//             className="data-[state=open]:bg-accent h-7 w-7"
//           >
//             <MoreHorizontal />
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent
//           className="w-56 overflow-hidden rounded-lg p-0"
//           align="end"
//         >
//           <Sidebar collapsible="none" className="bg-transparent">
//             <SidebarContent>
//               {data.map((group, index) => (
//                 <SidebarGroup key={index} className="border-b last:border-none">
//                   <SidebarGroupContent className="gap-0">
//                     <SidebarMenu>
//                       {group.map((item, index) => (
//                         <SidebarMenuItem key={index}>
//                           <SidebarMenuButton>
//                             <item.icon /> <span>{item.label}</span>
//                           </SidebarMenuButton>
//                         </SidebarMenuItem>
//                       ))}
//                     </SidebarMenu>
//                   </SidebarGroupContent>
//                 </SidebarGroup>
//               ))}
//             </SidebarContent>
//           </Sidebar>
//         </PopoverContent>
//       </Popover>
//     </div>
//   )
// }
