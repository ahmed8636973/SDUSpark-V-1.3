import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface PackagePageProps {
  params: {
    id: string
  }
}

export default async function PackagePage({ params }: PackagePageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get package with sub-packages, videos, and user progress
  const { data: pkg, error } = await supabase
    .from("packages")
    .select(`
      *,
      sub_packages(
        *,
        videos(
          *,
          user_progress(
            completed,
            watched_duration,
            last_watched_at
          )
        )
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !pkg) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground">{pkg.name}</h1>
        {pkg.description && <p className="text-muted-foreground mt-1">{pkg.description}</p>}
      </div>

      {pkg.sub_packages && pkg.sub_packages.length > 0 ? (
        <div className="space-y-6">
          {pkg.sub_packages
            .sort((a, b) => a.order_index - b.order_index)
            .map((subPkg) => {
              const totalVideos = subPkg.videos?.length || 0
              const completedVideos =
                subPkg.videos?.filter((video) => video.user_progress?.some((progress) => progress.completed)).length ||
                0
              const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0

              return (
                <Card key={subPkg.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{subPkg.name}</CardTitle>
                        {subPkg.description && <CardDescription className="mt-1">{subPkg.description}</CardDescription>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {completedVideos}/{totalVideos} completed
                        </Badge>
                        {progressPercentage === 100 && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {subPkg.videos && subPkg.videos.length > 0 ? (
                      <div className="space-y-3">
                        {subPkg.videos
                          .sort((a, b) => a.order_index - b.order_index)
                          .map((video, index) => {
                            const isCompleted = video.user_progress?.some((progress) => progress.completed)
                            const watchedDuration = video.user_progress?.[0]?.watched_duration || 0
                            const lastWatched = video.user_progress?.[0]?.last_watched_at

                            return (
                              <div
                                key={video.id}
                                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-foreground">{video.title}</h4>
                                    {video.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2">
                                      {isCompleted && (
                                        <Badge variant="secondary" className="text-xs">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Completed
                                        </Badge>
                                      )}
                                      {watchedDuration > 0 && !isCompleted && (
                                        <Badge variant="outline" className="text-xs">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {Math.floor(watchedDuration / 60)}:
                                          {(watchedDuration % 60).toString().padStart(2, "0")} watched
                                        </Badge>
                                      )}
                                      {lastWatched && (
                                        <span className="text-xs text-muted-foreground">
                                          Last watched {new Date(lastWatched).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Button asChild>
                                  <Link href={`/dashboard/packages/${pkg.id}/videos/${video.id}`}>
                                    <Play className="h-4 w-4 mr-2" />
                                    {isCompleted ? "Rewatch" : watchedDuration > 0 ? "Continue" : "Watch"}
                                  </Link>
                                </Button>
                              </div>
                            )
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No videos available in this section</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No content available</h3>
            <p className="text-muted-foreground">This package doesn't have any learning materials yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
