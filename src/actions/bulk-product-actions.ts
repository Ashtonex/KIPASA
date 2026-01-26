"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type BulkProduct = {
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url: string
}

// Helper function to create a slug
function generateSlug(name: string) {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') 
    .replace(/^-+|-+$/g, '')
  
  const uniqueSuffix = Math.random().toString(36).substring(2, 6)
  return `${baseSlug}-${uniqueSuffix}`
}

export async function importBulkProducts(products: BulkProduct[]) {
  const supabase = await createClient()
  
  // 1. Format data for Supabase
  const formattedData = products.map(p => ({
    name: p.name,
    slug: generateSlug(p.name), 
    description: p.description || "",
    price: p.price,
    stock: p.stock,
    category: p.category || "Uncategorized",
    images: p.image_url ? [p.image_url] : []
    // REMOVED: is_active (This was causing the crash)
  }))

  // 2. Perform Bulk Insert
  const { error } = await supabase
    .from("products")
    .insert(formattedData)

  if (error) {
    console.error("Bulk Import Error:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/products")
  return { success: true, count: products.length }
}