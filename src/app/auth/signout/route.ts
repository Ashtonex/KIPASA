import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Sign out the user on the server
  await supabase.auth.signOut()

  // Redirect to login page or home page
  return NextResponse.redirect(new URL("/login", request.url), {
    status: 302,
  })
}