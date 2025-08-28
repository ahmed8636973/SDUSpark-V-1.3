"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface VideoActionsProps {
  video: {
    id: string
    title: string
  }
}

export function VideoActions({ video }: VideoActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const deleteVideo = async () => {
    if (!confirm(`Are you sure you want to delete "${video.title}"?`)) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.from("videos").delete().eq("id", video.id)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting video:", error)
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
        <DropdownMenuItem onClick={deleteVideo} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Video
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
