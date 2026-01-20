"use server"

import { createAdminClient } from "@/lib/supabase/admin" // SWITCH TO ADMIN CLIENT
import { revalidatePath } from "next/cache"

export async function updateSiteContent(prevState: any, formData: FormData) {
  try {
    // 1. Use Admin Client to bypass RLS policy blocks
    const supabase = await createAdminClient()

    // 2. Extract form fields
    const slug = formData.get("slug") as string
    const title = formData.get("title") as string
    const subtitle = formData.get("subtitle") as string
    const button_text = formData.get("button_text") as string

    // This expects the form to include the OLD url if no new file is uploaded
    const current_db_image = formData.get("current_image_url") as string
    const image_file = formData.get("banner_file") as File

    if (!slug) {
      return { success: false, error: "Missing content slug. Update aborted." }
    }

    let final_image_url = current_db_image

    // 3. Handle Direct File Upload
    if (image_file && image_file.size > 0) {
      // Clean filename
      const fileExt = image_file.name.split('.').pop()
      const fileName = `${slug}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('site-assets') // Ensure this bucket exists and is public
        .upload(fileName, image_file, {
          upsert: true,
          contentType: image_file.type
        })

      if (uploadError) {
        console.error("Storage Upload Error:", uploadError)
        return { success: false, error: `Upload failed: ${uploadError.message}` }
      }

      // Generate Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName)

      final_image_url = publicUrl
    }

    // 4. Update Database
    const { error: dbError } = await supabase
      .from("site_content")
      .update({
        title,
        subtitle,
        button_text,
        image_url: final_image_url, // Uses new file OR preserves old one
        updated_at: new Date().toISOString()
      })
      .eq("slug", slug) // CRITICAL: This must match the DB row 'slug'

    if (dbError) {
      console.error("Database Update Error:", dbError)
      return { success: false, error: `DB Update failed: ${dbError.message}` }
    }

    // 5. Purge Cache
    revalidatePath("/")
    revalidatePath("/admin/content")

    return { success: true, message: "Banner updated successfully" }

  } catch (err: any) {
    console.error("Action Execution Error:", err.message)
    return { success: false, error: err.message || "Internal system error." }
  }
}