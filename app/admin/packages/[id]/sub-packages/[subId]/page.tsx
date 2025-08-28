import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreateVideoDialog } from "@/components/admin/create-video-dialog"
import { VideoActions } from "@/components/admin/video-actions"
import { Plus, ArrowLeft, Play, ExternalLink } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface SubPackageDetailPageProps {
  params: {
    id: string
    subId: string
  }
}

export default async function SubPackageDetailPage({ params }: SubPackageDetailPageProps) {
  const supabase = await createClient()

  // Get sub-package with videos and parent package info
  const { data: subPackage, error } = await supabase
    .from("sub_packages")
    .select(`
      *,
      package:packages(*),
      videos(*)
    `)
    .eq("id", params.subId)
    .single()

  if (error || !subPackage) {
    notFound()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/packages/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {subPackage.package.name}
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>{subPackage.package.name}</span>
            <span>/</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{subPackage.name}</h1>
          {subPackage.description && <p className="text-muted-foreground mt-1">{subPackage.description}</p>}
        </div>
        <CreateVideoDialog subPackageId={subPackage.id}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Video
          </Button>
        </CreateVideoDialog>
      </div>

      {subPackage.videos && subPackage.videos.length > 0 ? (
        <div className="space-y-4">
          {subPackage.videos
            .sort((a, b) => a.order_index - b.order_index)
            .map((video, index) => (
              <Card key={video.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{video.title}</CardTitle>
                        {video.description && <CardDescription className="mt-1">{video.description}</CardDescription>}
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary">YouTube</Badge>
                          {video.duration && (
                            <Badge variant="outline">
                              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <VideoActions video={video} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Button asChild>
                      <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">
                        <Play className="h-4 w-4 mr-2" />
                        Watch Video
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in YouTube
                      </a>
                    </Button>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">Video ID: {video.youtube_video_id}</div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No videos yet</h3>
            <p className="text-muted-foreground mb-6">Add YouTube videos to this sub-package</p>
            <CreateVideoDialog subPackageId={subPackage.id}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Video
              </Button>
            </CreateVideoDialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
