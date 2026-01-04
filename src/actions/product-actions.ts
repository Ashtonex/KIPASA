"use server"

import { createClient } from "@/lib/supabase/server"

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

  // 1. Base Query
  let query = supabase
    .from("products")
    .select("*, categories!inner(name, slug)", { count: "exact" })

  // 2. Apply Filters
  if (filters.category) {
    query = query.eq("categories.slug", filters.category)
  }
  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`)
  }

  // 3. Apply Sorting
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

  // 4. Apply Pagination
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