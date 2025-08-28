import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreateSubPackageDialog } from "@/components/admin/create-sub-package-dialog"
import { SubPackageActions } from "@/components/admin/sub-package-actions"
import { Plus, ArrowLeft, Folder, Play } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface PackageDetailPageProps {
  params: {
    id: string
  }
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const supabase = await createClient()

  // Get package with sub-packages and videos
  const { data: pkg, error } = await supabase
    .from("packages")
    .select(`
      *,
      sub_packages(
        *,
        videos(*)
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !pkg) {
    notFound()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/packages">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Packages
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{pkg.name}</h1>
          {pkg.description && <p className="text-muted-foreground mt-1">{pkg.description}</p>}
        </div>
        <CreateSubPackageDialog packageId={pkg.id}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Sub-Package
          </Button>
        </CreateSubPackageDialog>
      </div>

      {pkg.sub_packages && pkg.sub_packages.length > 0 ? (
        <div className="space-y-4">
          {pkg.sub_packages
            .sort((a, b) => a.order_index - b.order_index)
            .map((subPkg) => (
              <Card key={subPkg.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{subPkg.name}</CardTitle>
                      {subPkg.description && <CardDescription className="mt-1">{subPkg.description}</CardDescription>}
                    </div>
                    <SubPackageActions subPackage={subPkg} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">
                      <Play className="h-3 w-3 mr-1" />
                      {subPkg.videos?.length || 0} videos
                    </Badge>
                  </div>

                  {subPkg.videos && subPkg.videos.length > 0 ? (
                    <div className="space-y-2">
                      {subPkg.videos
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((video, index) => (
                          <div key={video.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">{video.title}</h4>
                                {video.description && (
                                  <p className="text-sm text-muted-foreground">{video.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    YouTube
                                  </Badge>
                                  {video.duration && (
                                    <span className="text-xs text-muted-foreground">
                                      {Math.floor(video.duration / 60)}:
                                      {(video.duration % 60).toString().padStart(2, "0")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">
                                <Play className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No videos in this sub-package yet</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/packages/${pkg.id}/sub-packages/${subPkg.id}`}>
                        <Folder className="h-4 w-4 mr-2" />
                        Manage Videos
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No sub-packages yet</h3>
            <p className="text-muted-foreground mb-6">Create sub-packages to organize your content</p>
            <CreateSubPackageDialog packageId={pkg.id}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Sub-Package
              </Button>
            </CreateSubPackageDialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
