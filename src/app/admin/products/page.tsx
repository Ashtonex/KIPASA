import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
// FIXED: FolderOpen (PascalCase) to prevent build errors
import { Plus, Pencil, Trash2, Megaphone, Package, FolderOpen, LayoutGrid } from "lucide-react"
import { deleteProduct } from "@/actions/admin-products-actions"
import { PromoToggles } from "@/components/admin/PromoToggles"

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Product Management</h1>
        
        <div className="flex gap-3">
          {/* NEW: Link to Category Management */}
          <Button variant="outline" asChild className="rounded-xl border-gray-200">
            <Link href="/admin/categories">
              <LayoutGrid className="mr-2 h-4 w-4" /> Manage Categories
            </Link>
          </Button>

          <Button asChild className="rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95">
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" /> Add New Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest font-bold border-b">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4"><div className="flex items-center gap-2"><FolderOpen className="h-3 w-3" /> Category</div></th>
              <th className="p-4">Price/Stock</th>
              <th className="p-4"><div className="flex items-center gap-2"><Megaphone className="h-3 w-3" /> Promotions</div></th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products?.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-xl border bg-gray-50 flex-shrink-0">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">N/A</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">{product.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">ID: {product.id.slice(0, 8)}</div>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                    product.category 
                      ? 'bg-blue-50 text-blue-600 border-blue-100' 
                      : 'bg-amber-50 text-amber-600 border-amber-100 italic'
                  }`}>
                    {product.category || "Uncategorized"}
                  </span>
                </td>

                <td className="p-4">
                  <div className="font-bold text-primary">${product.price}</div>
                  <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                    product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {product.stock} in stock
                  </div>
                </td>
                
                <td className="p-4">
                  <PromoToggles 
                    productId={product.id} 
                    isFlashDeal={product.is_flash_deal} 
                    isJustForYou={product.is_just_for_you} 
                  />
                </td>

                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild className="rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                      <Link href={`/admin/products/${product.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <form action={deleteProduct.bind(null, product.id)}>
                      <Button variant="ghost" size="icon" className="rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!products || products.length === 0) && (
          <div className="p-20 text-center text-gray-400">
            <Package className="h-10 w-10 mx-auto mb-4 opacity-10" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm">Start by adding your first product to the store.</p>
          </div>
        )}
      </div>
    </div>
  )
}