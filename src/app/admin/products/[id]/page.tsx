import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/ProductForm"

// 1. Update the type definition to wrap params in Promise
export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient()

  // 2. Await the params to extract the ID safely
  const { id } = await params

  // 3. Use the extracted 'id' in your query
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      {product ? (
        <ProductForm product={product} />
      ) : (
        <p className="text-muted-foreground">Product not found.</p>
      )}
    </div>
  )
}