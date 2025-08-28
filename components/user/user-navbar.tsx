"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { LogOut, User, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserNavbarProps {
  user: {
    email: string
    full_name: string | null
  }
}

export function UserNavbar({ user }: UserNavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (currentUser) {
        // Deactivate current device session
        await supabase
          .from("device_sessions")
          .update({ is_active: false })
          .eq("user_id", currentUser.id)
          .eq("is_active", true)

        // Clear device_id from profile
        await supabase.from("profiles").update({ device_id: null }).eq("id", currentUser.id)
      }

      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error during sign out:", error)
      // Still try to sign out even if device cleanup fails
      await supabase.auth.signOut()
      router.push("/auth/login")
    }
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">EDUSpark</h1>
          <p className="text-sm text-muted-foreground">Learning Platform</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span className="text-foreground">{user.full_name || user.email}</span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}
