"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimpleSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSetup = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "ahmed8636973@gmail.com",
          password: "123456789951",
          fullName: "Admin User",
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage("Admin account created successfully! You can now login.")
      } else {
        setMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setMessage("Setup failed. Please check environment variables.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>EDUSpark Setup</CardTitle>
          <CardDescription>Create admin account and database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>
              <strong>Email:</strong> ahmed8636973@gmail.com
            </p>
            <p>
              <strong>Password:</strong> 123456789951
            </p>
          </div>

          <Button onClick={handleSetup} disabled={isLoading} className="w-full">
            {isLoading ? "Setting up..." : "Setup Admin Account"}
          </Button>

          {message && (
            <div
              className={`text-sm p-3 rounded ${
                message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
