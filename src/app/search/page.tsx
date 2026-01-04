import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/feature/ProductCard"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const { q } = await searchParams // Await for Next.js 15

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .ilike("name", `%${q || ""}%`)

  return (
    <div className="container mx-auto min-h-[60vh] py-16 px-4 md:px-6 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
          Search Results
        </h1>
        <p className="text-muted-foreground italic">
          Showing results for "{q}"
        </p>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl max-w-md mx-auto">
          <p className="text-xl font-semibold text-gray-400">No items found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different keyword or check your spelling.</p>
        </div>
      )}
    </div>
  )
}