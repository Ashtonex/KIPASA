"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type BulkProduct = {
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url: string // We will accept a URL here
}

export async function importBulkProducts(products: BulkProduct[]) {
  const supabase = await createClient()
  
  // 1. Format data for Supabase
  // We map the incoming CSV data to your DB structure
  const formattedData = products.map(p => ({
    name: p.name,
    description: p.description || "",
    price: p.price,
    stock: p.stock,
    category: p.category || "Uncategorized",
    // If an image URL is provided, put it in the images array
    images: p.image_url ? [p.image_url] : [],
    is_active: true
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