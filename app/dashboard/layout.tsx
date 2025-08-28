import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserNavbar } from "@/components/user/user-navbar"

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is regular user (not admin)
  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role === "admin") {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar user={{ ...user, full_name: profile.full_name }} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
