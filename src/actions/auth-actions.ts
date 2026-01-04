"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

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