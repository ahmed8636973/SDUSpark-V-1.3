import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/utils/supabase/client"

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    if (!name) return NextResponse.json({ error: "Package name is required" }, { status: 400 })

    const { data, error } = await supabaseAdmin.from("packages").insert([{ name }]).select()
    if (error) throw error

    return NextResponse.json({ message: "Package created", package: data[0] }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
