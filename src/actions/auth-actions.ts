"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

/**
 * AUTH ACTION: RESET PASSWORD
 * Sends a password reset link via Supabase Auth.
 * The redirectTo URL should be configured in your Supabase dashboard.
 */
export async function resetPasswordAction(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string

  // Step 1: Request password reset email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Ensure this path matches where you handle the new password entry
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  return { error: "", success: true }
}

// --- REGISTER ACTION ---
export async function registerUser(prevState: any, formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("full_name") as string

  // We only need to sign up. 
  // The SQL Trigger we just added will automatically create the Profile!
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // This is passed to the Trigger
      },
    },
  })

  if (error) {
    return { error: error.message, success: false }
  }

  // Success!
  return { error: "", success: true }
}

// --- LOGIN ACTION ---
export async function loginUser(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  redirect("/")
}

// --- LOGOUT ACTION ---
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}