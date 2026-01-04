"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// AMENDED: Added 'prevState' as the first parameter to satisfy useActionState signature
export async function updateSiteContent(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient()
    
    // 1. Extract form fields
    const slug = formData.get("slug") as string
    const title = formData.get("title") as string
    const subtitle = formData.get("subtitle") as string
    const button_text = formData.get("button_text") as string
    const manual_url = formData.get("image_url") as string
    const image_file = formData.get("banner_file") as File 

    let final_image_url = manual_url

    // 2. Handle Direct File Upload
    if (image_file && image_file.size > 0) {
      // Create a clean filename with a timestamp to avoid browser caching
      const fileExt = image_file.name.split('.').pop()
      const fileName = `${slug}-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, image_file, {
          upsert: true,
          contentType: image_file.type // Correct MIME type handling
        })

      if (uploadError) {
        console.error("Storage Upload Error:", uploadError)
        return { success: false, error: `Upload failed: ${uploadError.message}` }
      }

      // 3. Generate the Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName)
        
      final_image_url = publicUrl
    }

    // 4. Synchronize with Database
    const { error: dbError } = await supabase
      .from("site_content")
      .update({ 
        title, 
        subtitle, 
        button_text, 
        image_url: final_image_url,
        updated_at: new Date().toISOString() 
      })
      .eq("slug", slug)

    if (dbError) {
      console.error("Database Update Error:", dbError)
      return { success: false, error: `DB Update failed: ${dbError.message}` }
    }

    // 5. Purge Cache for instant global updates
    revalidatePath("/")
    revalidatePath("/admin/content")
    
    return { success: true }

  } catch (err: any) {
    console.error("Action Execution Error:", err.message)
    return { success: false, error: err.message || "Internal system error." }
  }
}