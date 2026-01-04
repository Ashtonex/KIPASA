"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addCategory(name: string) {
  const supabase = await createClient()
  const slug = name.toLowerCase().trim().replace(/\s+/g, '-')

  const { error } = await supabase
    .from("categories")
    .insert({ name, slug })

  if (error) throw new Error(error.message)
  
  revalidatePath("/admin/products/new")
  revalidatePath("/admin/categories")
}

export async function deleteCategory(slug: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("categories").delete().eq("slug", slug)

  if (error) throw new Error(error.message)
  
  revalidatePath("/admin/categories")
}