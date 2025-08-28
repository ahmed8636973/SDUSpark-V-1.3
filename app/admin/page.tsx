"use client"

import { useState } from "react"
import { supabaseAdmin } from "@/utils/supabase/admin"
import { supabaseClient } from "@/utils/supabase/client"

export default function AdminDashboard() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [message, setMessage] = useState("")

  // ✅ إضافة مستخدم جديد
  const createUser = async () => {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { fullName },
    })

    if (error) {
      setMessage("❌ " + error.message)
    } else {
      setMessage("✅ User created successfully: " + data.user.email)
      setEmail("")
      setPassword("")
      setFullName("")
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🔑 Admin Dashboard</h1>

      {/* Create User */}
      <div className="p-4 border rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">👤 Create New User</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="email"
          placeholder="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="password"
          placeholder="User Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={createUser}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create User
        </button>
        {message && <p className="mt-2">{message}</p>}
      </div>

      {/* TODO: Packages / Sub-packages / Videos */}
      <div className="p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">📦 Manage Packages</h2>
        <p>⬅️ هنضيف هنا بعدين: Create Package / Sub-Package / Add Videos</p>
      </div>
    </div>
  )
}
