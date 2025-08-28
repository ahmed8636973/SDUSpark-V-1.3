"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function DeviceLogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to sign out from this device?")) {
      return
    }

    setIsLoading(true)
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Deactivate current device session
        await supabase.from("device_sessions").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true)

        // Clear device_id from profile
        await supabase.from("profiles").update({ device_id: null }).eq("id", user.id)
      }

      // Sign out
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="destructive" onClick={handleLogout} disabled={isLoading}>
      <LogOut className="h-4 w-4 mr-2" />
      {isLoading ? "Signing out..." : "Sign Out from This Device"}
    </Button>
  )
}
