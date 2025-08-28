"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { MoreHorizontal, Trash2, UserX, UserCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface UserActionsProps {
  user: {
    id: string
    email: string
    full_name: string | null
    role: string
    is_active: boolean
  }
}

export function UserActions({ user }: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const toggleUserStatus = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("profiles").update({ is_active: !user.is_active }).eq("id", user.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error updating user status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    try {
      // Note: This will cascade delete the profile due to foreign key constraint
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isLoading}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={toggleUserStatus}>
          {user.is_active ? (
            <>
              <UserX className="h-4 w-4 mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={deleteUser} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
