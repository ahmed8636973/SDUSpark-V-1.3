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

interface CreateSubPackageDialogProps {
  children: React.ReactNode
  packageId: string
}

export function CreateSubPackageDialog({ children, packageId }: CreateSubPackageDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Get current max order_index
      const { data: existingSubPackages } = await supabase
        .from("sub_packages")
        .select("order_index")
        .eq("package_id", packageId)
        .order("order_index", { ascending: false })
        .limit(1)

      const nextOrderIndex =
        existingSubPackages && existingSubPackages.length > 0 ? existingSubPackages[0].order_index + 1 : 0

      const { error: insertError } = await supabase.from("sub_packages").insert({
        package_id: packageId,
        name: formData.name,
        description: formData.description || null,
        order_index: nextOrderIndex,
      })

      if (insertError) throw insertError

      // Reset form and close dialog
      setFormData({ name: "", description: "" })
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
          <DialogTitle>Create Sub-Package</DialogTitle>
          <DialogDescription>Create a new sub-package to organize videos within this package.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Sub-Package Name</Label>
            <Input
              id="name"
              placeholder="Enter sub-package name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter sub-package description"
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
              {isLoading ? "Creating..." : "Create Sub-Package"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
