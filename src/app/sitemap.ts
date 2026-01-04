import { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const supabase = await createClient()

  // 1. Fetch all products
  const { data: products } = await supabase
    .from("products")
    .select("id, created_at")

  // 2. Generate URLs for products
  const productUrls = products?.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(product.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  })) || []

  // 3. Define Static Pages
  const staticRoutes = [
    "",
    "/products",
    "/login",
    "/register",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1,
  }))

  return [...staticRoutes, ...productUrls]
}