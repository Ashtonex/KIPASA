"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get("email") as string
  
  if (!email || !email.includes("@")) {
    return { success: false, message: "Please provide a valid email." }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email })

  if (error) {
    if (error.code === "23505") { // Unique constraint violation
      return { success: false, message: "You are already subscribed!" }
    }
    return { success: false, message: "Something went wrong. Try again." }
  }

  revalidatePath("/")
  return { success: true, message: "Thank you for subscribing!" }
}