import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/utils/supabase/client"

export async function POST(request: NextRequest) {
  try {
    const { packageId, name } = await request.json()
    if (!packageId || !name) return NextResponse.json({ error: "PackageId and name are required" }, { status: 400 })

    const { data, error } = await supabaseAdmin.from("sub_packages").insert([{ package_id: packageId, name }]).select()
    if (error) throw error

    return NextResponse.json({ message: "Sub-package created", subPackage: data[0] }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
