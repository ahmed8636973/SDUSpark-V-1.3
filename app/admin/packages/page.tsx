import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreatePackageDialog } from "@/components/admin/create-package-dialog"
import { PackageActions } from "@/components/admin/package-actions"
import { Plus, Package, Folder, Play } from "lucide-react"
import Link from "next/link"

export default async function PackagesPage() {
  const supabase = await createClient()

  // Get packages with sub-package and video counts
  const { data: packages, error } = await supabase
    .from("packages")
    .select(`
      *,
      sub_packages(
        id,
        videos(id)
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching packages:", error)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Package Management</h1>
          <p className="text-muted-foreground">Organize your learning content into packages</p>
        </div>
        <CreatePackageDialog>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Package
          </Button>
        </CreatePackageDialog>
      </div>

      {packages && packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const subPackageCount = pkg.sub_packages?.length || 0
            const videoCount = pkg.sub_packages?.reduce((total, subPkg) => total + (subPkg.videos?.length || 0), 0) || 0

            return (
              <Card key={pkg.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      {pkg.description && <CardDescription className="mt-1">{pkg.description}</CardDescription>}
                    </div>
                    <PackageActions package={pkg} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Folder className="h-4 w-4" />
                      <span>{subPackageCount} sub-packages</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      <span>{videoCount} videos</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/admin/packages/${pkg.id}`}>
                        <Package className="h-4 w-4 mr-2" />
                        Manage
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Created {new Date(pkg.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No packages yet</h3>
            <p className="text-muted-foreground mb-6">Create your first learning package to get started</p>
            <CreatePackageDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Package
              </Button>
            </CreatePackageDialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
