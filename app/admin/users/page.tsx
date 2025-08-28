import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreateUserDialog } from "@/components/admin/create-user-dialog"
import { UserActions } from "@/components/admin/user-actions"
import { Plus, Users } from "lucide-react"

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: users, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <CreateUserDialog>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        </CreateUserDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
          <CardDescription>{users?.length || 0} total users registered</CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium text-foreground">{user.full_name || "Unnamed User"}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                      <Badge variant={user.is_active ? "outline" : "destructive"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Created: {new Date(user.created_at).toLocaleDateString()}
                      {user.device_id && <span className="ml-4">Device: {user.device_id.slice(0, 8)}...</span>}
                    </div>
                  </div>
                  <UserActions user={user} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No users yet</h3>
              <p className="text-muted-foreground mb-4">Create your first user account to get started</p>
              <CreateUserDialog>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First User
                </Button>
              </CreateUserDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
