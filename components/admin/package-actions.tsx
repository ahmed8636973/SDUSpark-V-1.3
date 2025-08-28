"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface PackageActionsProps {
  package: {
    id: string
    name: string
  }
}

export function PackageActions({ package: pkg }: PackageActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const deletePackage = async () => {
    if (!confirm(`Are you sure you want to delete "${pkg.name}"? This will also delete all sub-packages and videos.`)) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.from("packages").delete().eq("id", pkg.id)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting package:", error)
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
        <DropdownMenuItem onClick={deletePackage} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Package
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
