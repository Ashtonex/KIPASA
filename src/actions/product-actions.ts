"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// --- EXISTING TYPES & READ FUNCTIONS (PRESERVED) ---

export type ProductFilter = {
  category?: string
  search?: string
  sort?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}

export async function getProducts(filters: ProductFilter) {
  const supabase = await createClient()
  const page = filters.page || 1
  const limit = filters.limit || 12
  const offset = (page - 1) * limit

  let query = supabase
    .from("products")
    .select("*, categories(name, slug)", { count: "exact" })

  if (filters.category) {
    query = query.eq("categories.slug", filters.category)
  }

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`)
  }

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return { data: [], count: 0 }
  }

  return { data, count }
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .single()

  if (error) return null
  return data
}

// --- CREATE PRODUCT ACTION (UPDATED: Now handles Stock) ---

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  // 1. Extract Data
  const name = formData.get("name") as string
  const priceString = formData.get("price") as string
  const price = priceString ? parseFloat(priceString) : 0
  const description = formData.get("description") as string

  // --- NEW: Read Stock Level from Form ---
  const stockString = formData.get("stock") as string
  const stock = stockString ? parseInt(stockString) : 0

  // 2. Handle Category (Default to 14 if missing)
  const rawCategoryId = formData.get("category_id")
  const category_id = rawCategoryId ? parseInt(rawCategoryId.toString()) : 14

  // 3. Generate Slug
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const slug = `${baseSlug}-${Date.now()}`

  // 4. Handle Image Upload
  let image_url = null
  const imageFile = formData.get("image") as File

  if (imageFile && imageFile.size > 0) {
    const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '-')}`
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile)

    if (uploadError) {
      console.error("Upload Error:", uploadError)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from("products")
      .getPublicUrl(fileName)

    image_url = publicUrl
  }

  // 5. Insert into Database
  const { error } = await supabase
    .from("products")
    .insert({
      name,
      price,
      description,
      category_id: category_id,
      slug: slug,
      images: image_url ? [image_url] : [],
      stock: stock, // <--- SAVING THE STOCK HERE (Was 0)
    })

  if (error) {
    console.error("Create Product Error:", error)
    return
  }

  revalidatePath("/products")
  revalidatePath("/admin/products")
  redirect("/admin/products")
}

// --- UPDATE PRODUCT ACTION (PRESERVED) ---

export async function updateProduct(formData: FormData) {
  const supabase = await createClient()

  // 1. Get Product ID
  const productId = formData.get("id") as string
  if (!productId) return

  // 2. Extract Data
  const name = formData.get("name") as string
  const priceString = formData.get("price") as string
  const price = priceString ? parseFloat(priceString) : 0
  const description = formData.get("description") as string
  const stock = parseInt(formData.get("stock") as string) || 0

  // 3. Handle Category (Ensuring valid integer)
  const rawCategoryId = formData.get("category_id")
  const category_id = rawCategoryId ? parseInt(rawCategoryId.toString()) : 14

  // 4. Handle Image Update
  const imageFile = formData.get("image") as File
  let image_url = null

  if (imageFile && imageFile.size > 0) {
    const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '-')}`
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile)

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(fileName)
      image_url = publicUrl
    }
  }

  // 5. Prepare Update Object
  const updates: any = {
    name,
    price,
    description,
    stock,
    category_id,
    // REMOVED: updated_at (Your DB doesn't have this column)
  }

  // Only overwrite image if a new one was uploaded
  if (image_url) {
    updates.images = [image_url]
  }

  // 6. Execute Update
  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId)

  if (error) {
    console.error("Update Error:", error)
    return
  }

  // 7. Refresh and Redirect
  revalidatePath("/products")
  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${productId}`)
  redirect("/admin/products")
}