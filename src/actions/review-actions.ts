"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "You must be logged in." }

  const productId = formData.get("productId") as string
  const rating = parseInt(formData.get("rating") as string)
  const comment = formData.get("comment") as string

  const { error } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      product_id: productId,
      rating,
      comment
    })

  if (error) {
    if (error.code === '23505') return { error: "You have already reviewed this product." }
    return { error: "Failed to submit review." }
  }

  revalidatePath(`/products/${productId}`)
  return { success: true }
}