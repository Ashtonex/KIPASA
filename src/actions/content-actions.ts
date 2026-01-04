"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateSiteContent(formData: FormData) {
  const supabase = await createClient()
  
  const slug = formData.get("slug") as string
  const title = formData.get("title") as string
  const subtitle = formData.get("subtitle") as string
  const button_text = formData.get("button_text") as string
  const manual_url = formData.get("image_url") as string
  const image_file = formData.get("banner_file") as File // Direct device upload

  let final_image_url = manual_url

  // If a file was uploaded from the device, upload it to Supabase Storage
  if (image_file && image_file.size > 0) {
    const fileName = `${slug}-${Date.now()}`
    const { data, error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(fileName, image_file)

    if (uploadError) throw new Error("Upload failed: " + uploadError.message)

    // Get the Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('site-assets')
      .getPublicUrl(fileName)
      
    final_image_url = publicUrl
  }

  const { error } = await supabase
    .from("site_content")
    .update({ title, subtitle, button_text, image_url: final_image_url })
    .eq("slug", slug)

  if (error) throw new Error(error.message)

  revalidatePath("/")
  return { success: true }
}