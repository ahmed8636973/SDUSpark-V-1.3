import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/utils/supabase/client"

export async function POST(request: NextRequest) {
  try {
    const { subPackageId, youtubeUrl } = await request.json()
    if (!subPackageId || !youtubeUrl) return NextResponse.json({ error: "subPackageId and youtubeUrl are required" }, { status: 400 })

    const { data, error } = await supabaseAdmin.from("videos").insert([{ sub_package_id: subPackageId, youtube_url: youtubeUrl }]).select()
    if (error) throw error

    return NextResponse.json({ message: "Video added", video: data[0] }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
