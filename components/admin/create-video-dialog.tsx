"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface CreateVideoDialogProps {
  children: React.ReactNode
  subPackageId: string
}

export function CreateVideoDialog({ children, subPackageId }: CreateVideoDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
  })

  const router = useRouter()
  const supabase = createClient()

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const videoId = extractYouTubeVideoId(formData.youtubeUrl)
      if (!videoId) {
        throw new Error("Invalid YouTube URL. Please provide a valid YouTube video link.")
      }

      // Get current max order_index
      const { data: existingVideos } = await supabase
        .from("videos")
        .select("order_index")
        .eq("sub_package_id", subPackageId)
        .order("order_index", { ascending: false })
        .limit(1)

      const nextOrderIndex = existingVideos && existingVideos.length > 0 ? existingVideos[0].order_index + 1 : 0

      const { error: insertError } = await supabase.from("videos").insert({
        sub_package_id: subPackageId,
        title: formData.title,
        description: formData.description || null,
        youtube_url: formData.youtubeUrl,
        youtube_video_id: videoId,
        order_index: nextOrderIndex,
      })

      if (insertError) throw insertError

      // Reset form and close dialog
      setFormData({ title: "", description: "", youtubeUrl: "" })
      setOpen(false)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Video</DialogTitle>
          <DialogDescription>Add a YouTube video to this sub-package.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Video Title</Label>
            <Input
              id="title"
              placeholder="Enter video title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">YouTube URL</Label>
            <Input
              id="youtubeUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter video description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Video"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
