"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface SubPackageActionsProps {
  subPackage: {
    id: string
    name: string
  }
}

export function SubPackageActions({ subPackage }: SubPackageActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const deleteSubPackage = async () => {
    if (!confirm(`Are you sure you want to delete "${subPackage.name}"? This will also delete all videos.`)) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.from("sub_packages").delete().eq("id", subPackage.id)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting sub-package:", error)
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
        <DropdownMenuItem onClick={deleteSubPackage} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Sub-Package
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
