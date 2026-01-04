"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { processRestockNotifications } from "./notification-actions"

/**
 * FETCH CATEGORIES
 * Fetches name (label) and the numerical ID (value) as seen in your DB.
 */
export async function getCategories() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug") // Fetching ID for database linking
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  // Value is set to 'id' (converted to string for the Select component)
  return data.map(cat => ({
    label: cat.name,
    value: String(cat.id) 
  }))
}

// --- FIXED HELPER: Ensures slugs are URL-friendly ---
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") 
    .replace(/[\s_-]+/g, "-") 
    .replace(/^-+|-+$/g, "") 
}

// --- UPSERT (Create or Update) ---
export async function upsertProduct(prevState: any, formData: FormData) {
  const supabase = await createClient()

  if (!formData) {
    return { message: "Error: Form data is missing." }
  }

  // 1. Extract Data
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  
  // Receives the numerical ID from the form
  const categoryId = formData.get("category") as string 
  
  const imageUrl = formData.get("imageUrl") as string
  
  const rawPrice = formData.get("price")
  const price = rawPrice ? parseFloat(rawPrice.toString()) : 0
  
  const rawStock = formData.get("stock")
  const stock = rawStock ? parseInt(rawStock.toString()) : 0

  const isFlashDeal = formData.get("is_flash_deal") === "on"
  const isJustForYou = formData.get("is_just_for_you") === "on"

  // 2. GENERATE PRODUCT SLUG
  const slug = generateSlug(name)

  // 3. Prepare Data Object
  const productData = {
    name,
    slug,
    description,
    price,
    category_id: parseInt(categoryId), // Maps to your 'category_id' int8 column
    stock,
    is_flash_deal: isFlashDeal,
    is_just_for_you: isJustForYou,
    ...(imageUrl ? { images: [imageUrl] } : {}), 
  }

  let error
  let targetId = id

  if (id) {
    // --- UPDATE EXISTING ---
    const { error: updateError } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
    error = updateError
  } else {
    // --- CREATE NEW ---
    const insertData = {
      ...productData,
      images: imageUrl ? [imageUrl] : [],
    }
    
    const { data: insertedProduct, error: insertError } = await supabase
      .from("products")
      .insert(insertData)
      .select('id')
      .single()
    
    error = insertError
    if (insertedProduct) targetId = insertedProduct.id
  }

  if (error) {
    console.error("Database Error:", error)
    if (error.code === "23505") {
      return { message: "A product with this name already exists." }
    }
    return { message: "Failed to save product: " + error.message }
  }

  // 4. TRIGGER NOTIFICATIONS
  if (stock > 0 && targetId) {
    await processRestockNotifications(targetId)
  }

  // --- REVALIDATION ---
  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath("/admin/products")
  revalidatePath("/admin/notifications")
  revalidatePath(`/products/${slug}`)
  
  redirect("/admin/products")
}

// --- DELETE ---
export async function deleteProduct(id: string) {
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .single()

  await supabase.from("products").delete().eq("id", id)
  
  revalidatePath("/")
  revalidatePath("/admin/products")
  revalidatePath("/admin/notifications")
  revalidatePath("/products")
  
  if (product) {
    revalidatePath(`/products/${product.slug}`)
  }
}

// --- QUICK TOGGLE ---
export async function updateProductPromo(productId: string, updates: { is_flash_deal?: boolean, is_just_for_you?: boolean }) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId)

  if (error) throw new Error(error.message)
  
  revalidatePath("/") 
  revalidatePath("/admin/products")
}