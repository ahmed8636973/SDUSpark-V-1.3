"use client"

import { Button } from "@/components/ui/button"
import { supabaseAdmin } from "@/utils/supabase/client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
// لو عندك cn helper
import { cn } from "@/utils/supabase/setup"

import { LayoutDashboard, Users, Package, BarChart3, Settings, LogOut } from "lucide-react"

const sidebarItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Packages", href: "/admin/packages", icon: Package },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabaseAdmin.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">EDUSpark</h1>
        <p className="text-sm text-muted-foreground">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Ic
