import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoPlayer } from "@/components/user/video-player"
import { ArrowLeft, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface VideoPageProps {
  params: {
    id: string
    videoId: string
  }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get video with package and sub-package info, plus user progress
  const { data: video, error } = await supabase
    .from("videos")
    .select(`
      *,
      sub_package:sub_packages(
        *,
        package:packages(*)
      ),
      user_progress(
        completed,
        watched_duration,
        last_watched_at
      )
    `)
    .eq("id", params.videoId)
    .single()

  if (error || !video) {
    notFound()
  }

  const userProgress = video.user_progress?.[0]
  const isCompleted = userProgress?.completed || false
  const watchedDuration = userProgress?.watched_duration || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/packages/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {video.sub_package.package.name}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <VideoPlayer
                videoId={video.youtube_video_id}
                videoDbId={video.id}
                userId={user?.id || ""}
                startTime={watchedDuration}
              />
            </CardContent>
          </Card>

          {/* Video Info */}
          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{video.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {video.sub_package.package.name} • {video.sub_package.name}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {isCompleted && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                  {watchedDuration > 0 && !isCompleted && (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor(watchedDuration / 60)}:{(watchedDuration % 60).toString().padStart(2, "0")} watched
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            {video.description && (
              <CardContent>
                <p className="text-muted-foreground">{video.description}</p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Sidebar with related videos */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">More from {video.sub_package.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <RelatedVideos packageId={params.id} currentVideoId={video.id} subPackageId={video.sub_package.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

async function RelatedVideos({
  packageId,
  currentVideoId,
  subPackageId,
}: {
  packageId: string
  currentVideoId: string
  subPackageId: string
}) {
  const supabase = await createClient()

  const { data: videos } = await supabase
    .from("videos")
    .select(`
      *,
      user_progress(completed)
    `)
    .eq("sub_package_id", subPackageId)
    .neq("id", currentVideoId)
    .order("order_index")

  if (!videos || videos.length === 0) {
    return <p className="text-muted-foreground text-sm">No other videos in this section</p>
  }

  return (
    <div className="space-y-3">
      {videos.map((video, index) => {
        const isCompleted = video.user_progress?.some((progress) => progress.completed)

        return (
          <Link key={video.id} href={`/dashboard/packages/${packageId}/videos/${video.id}`}>
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                {isCompleted ? <CheckCircle className="h-3 w-3" /> : index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground line-clamp-2">{video.title}</h4>
                {video.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
