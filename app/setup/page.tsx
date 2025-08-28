"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBrowserClient } from "@supabase/ssr"

export default function SetupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "admin",
          },
        },
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            role: "admin",
            full_name: fullName,
          })
          .eq("id", authData.user.id)

        if (profileError) {
          throw profileError
        }

        setIsSuccess(true)
        setMessage("Admin account created successfully! You can now log in.")
      }
    } catch (error: any) {
      setIsSuccess(false)
      setMessage(error.message || "Failed to create admin account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">EDUSpark Setup</CardTitle>
          <CardDescription>Create the initial admin account for your learning platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetupAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Admin User"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eduspark.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter secure password"
                required
                minLength={6}
              />
            </div>

            {message && (
              <Alert className={isSuccess ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className={isSuccess ? "text-green-800" : "text-red-800"}>{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? "Creating Admin Account..." : "Create Admin Account"}
            </Button>
          </form>

          {isSuccess && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => (window.location.href = "/auth/login")} className="w-full">
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
