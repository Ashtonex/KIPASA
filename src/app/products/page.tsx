import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/feature/ProductCard"
import { ProductFilters } from "@/components/feature/ProductFilters"

export const metadata = {
  title: "All Products | Kipasa Store",
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  
  // NEXT.JS 15 FIX: searchParams must be awaited before accessing properties
  const resolvedParams = await searchParams;

  const categorySlug = typeof resolvedParams.category === "string" ? resolvedParams.category.toLowerCase() : undefined
  const searchQuery = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined
  const sortOption = typeof resolvedParams.sort === "string" ? resolvedParams.sort : "newest"
  const minPrice = typeof resolvedParams.minPrice === "string" ? Number(resolvedParams.minPrice) : undefined
  const maxPrice = typeof resolvedParams.maxPrice === "string" ? Number(resolvedParams.maxPrice) : undefined

  // 1. Fetch Categories for the filter sidebar
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  // 2. Build the Product Query
  // Adding !inner tells Supabase to filter the 'products' table based on the 'categories' join
  let query = supabase
    .from("products")
    .select("*, categories:category_id!inner(name, slug)")

  // FIX: Match the text slug from the URL against the slug in the joined categories table
  if (categorySlug) {
    query = query.eq("categories.slug", categorySlug)
  }

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`)
  }

  if (minPrice !== undefined) query = query.gte("price", minPrice)
  if (maxPrice !== undefined) query = query.lte("price", maxPrice)

  // 3. Apply Sorting
  if (sortOption === "price-asc") query = query.order("price", { ascending: true })
  else if (sortOption === "price-desc") query = query.order("price", { ascending: false })
  else query = query.order("created_at", { ascending: false })

  const { data: products, error } = await query

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <ProductFilters categories={categories || []} />
        </aside>

        {/* Main Product Grid */}
        <main className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {categorySlug 
                  ? categorySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                  : "All Products"}
              </h1>
              <p className="text-muted-foreground">
                Showing {products?.length || 0} products
              </p>
            </div>
          </div>

          {error ? (
            <div className="py-20 text-center text-red-500 border-2 border-dashed rounded-xl border-red-200 bg-red-50">
              <p className="font-bold">Database Query Error</p>
              <p className="text-sm">{error.message}</p>
            </div>
          ) : products?.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed rounded-xl border-gray-200">
              <p className="text-xl font-semibold">No products found.</p>
              <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}