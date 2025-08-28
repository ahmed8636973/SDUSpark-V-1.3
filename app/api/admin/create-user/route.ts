import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/utils/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    // إنشاء الحساب عن طريق admin key
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // الحساب يبقى مفعل على طول
      user_metadata: { fullName },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data.user }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
