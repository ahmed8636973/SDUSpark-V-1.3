import fs from "fs"
import path from "path"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.SUPABASE_SERVICE_ROLE_KEY?.replace("postgres://", "postgresql://")
})

async function runMigration() {
  try {
    const filePath = path.join(process.cwd(), "supabase/migrations/init.sql")
    const sql = fs.readFileSync(filePath, "utf-8")

    const statements = sql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length)

    for (const stmt of statements) {
      await pool.query(stmt)
    }

    console.log("Migration executed successfully")
  } catch (err: any) {
    console.error("Migration error:", err.message)
  } finally {
    await pool.end()
  }
}

runMigration()
