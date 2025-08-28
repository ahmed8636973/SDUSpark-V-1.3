import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeviceLogoutButton } from "@/components/user/device-logout-button"
import { Smartphone, Monitor, Tablet, Clock, MapPin } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user's device sessions
  const { data: deviceSessions } = await supabase
    .from("device_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("last_activity", { ascending: false })

  const activeSession = deviceSessions?.find((session) => session.is_active)
  const inactiveSessions = deviceSessions?.filter((session) => !session.is_active) || []

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
      return Smartphone
    }
    if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
      return Tablet
    }
    return Monitor
  }

  const getDeviceName = (userAgent: string) => {
    if (userAgent.includes("iPhone")) return "iPhone"
    if (userAgent.includes("iPad")) return "iPad"
    if (userAgent.includes("Android")) return "Android Device"
    if (userAgent.includes("Windows")) return "Windows PC"
    if (userAgent.includes("Mac")) return "Mac"
    if (userAgent.includes("Linux")) return "Linux PC"
    return "Unknown Device"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account and device access</p>
      </div>

      {/* Current Device */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Current Device
          </CardTitle>
          <CardDescription>You are currently signed in on this device</CardDescription>
        </CardHeader>
        <CardContent>
          {activeSession ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {(() => {
                  const DeviceIcon = getDeviceIcon(activeSession.user_agent || "")
                  return <DeviceIcon className="h-8 w-8 text-muted-foreground" />
                })()}
                <div>
                  <h3 className="font-medium text-foreground">{getDeviceName(activeSession.user_agent || "")}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Last active: {new Date(activeSession.last_activity).toLocaleString()}</span>
                    </div>
                    {activeSession.device_info?.timezone && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{activeSession.device_info.timezone}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Device ID: {activeSession.device_fingerprint.slice(0, 8)}...
                  </div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
            </div>
          ) : (
            <p className="text-muted-foreground">No active device session found</p>
          )}
        </CardContent>
      </Card>

      {/* Device Restriction Info */}
      <Card>
        <CardHeader>
          <CardTitle>Device Restriction</CardTitle>
          <CardDescription>Security information about device access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Single Device Policy</h4>
            <p className="text-sm text-muted-foreground">
              For security reasons, you can only be logged in on one device at a time. When you log in on a new device,
              you will be automatically signed out from your previous device.
            </p>
          </div>

          {activeSession && (
            <div className="flex justify-end">
              <DeviceLogoutButton />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Previous Devices */}
      {inactiveSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Devices</CardTitle>
            <CardDescription>Devices you've previously signed in from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inactiveSessions.slice(0, 5).map((session) => {
                const DeviceIcon = getDeviceIcon(session.user_agent || "")
                return (
                  <div key={session.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <DeviceIcon className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-foreground">{getDeviceName(session.user_agent || "")}</h4>
                        <div className="text-sm text-muted-foreground">
                          Last used: {new Date(session.last_activity).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Device ID: {session.device_fingerprint.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">Inactive</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
