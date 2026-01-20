import { createClient } from "@/lib/supabase/server"
import { updateProduct } from "@/actions/product-actions"
import { ArrowLeft, Package, ShieldCheck, Save, UploadCloud } from "lucide-react"
import Link from "next/link"

// 1. Updated type definition for Next.js 15
export default async function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()

  // 2. Await the params to extract the ID safely
  const { id } = await params

  // 3. Concurrent Fetch: Get Product and Categories
  const [productResult, categoriesResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name").order("name", { ascending: true })
  ])

  const { data: product } = productResult
  const { data: categories } = categoriesResult

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">

      {/* --- High-Tech Navigation Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <Link
            href="/admin/products"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all mb-3 group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Return_to_Inventory
          </Link>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Product_Editor
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Node_ID: <span className="text-slate-900">{id.slice(0, 8)}</span>
          </span>
        </div>
      </div>

      {/* --- Main Configuration Engine --- */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 transition-all p-8">

        {product ? (
          // --- THE INLINED FORM (Guarantees Updates Work) ---
          <form action={updateProduct} className="space-y-8">

            {/* HIDDEN ID FIELD (Critical for telling the server WHICH product to update) */}
            <input type="hidden" name="id" value={product.id} />

            <div className="grid gap-8 md:grid-cols-2">
              {/* 1. Name */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">Product Name</label>
                <input
                  name="name"
                  defaultValue={product.name}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* 2. Category Dropdown (Pre-selected) */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-blue-600 flex items-center gap-2">
                  Category
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[9px]">DB LINKED</span>
                </label>
                <div className="relative">
                  <select
                    name="category_id"
                    defaultValue={product.category_id || 14} // Use current category or fallback to 14
                    className="w-full appearance-none bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer hover:bg-blue-50 transition-all"
                  >
                    <option value="14">General / Uncategorized</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} (ID: {cat.id})
                      </option>
                    ))}
                  </select>
                  {/* Arrow Icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* 3. Price */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={product.price}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* 4. Stock Level */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">Stock Level</label>
                <input
                  name="stock"
                  type="number"
                  defaultValue={product.stock || 0}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* 5. Description */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Description</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={product.description}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* 6. Image Update */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Product Image</label>

              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center hover:bg-slate-50 transition-all group relative flex flex-col items-center gap-4">

                {/* Image Preview (If exists) */}
                {product.images && product.images[0] && (
                  <div className="relative h-32 w-32 rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-2 group-hover:opacity-50 transition-opacity">
                    <img src={product.images[0]} alt="Current" className="w-full h-full object-cover" />
                  </div>
                )}

                <input type="file" name="image" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />

                <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-600 transition-colors z-20 pointer-events-none">
                  <UploadCloud className="w-5 h-5" />
                  <span className="text-sm font-bold">
                    {product.images?.[0] ? "Click to Replace Image" : "Upload Image"}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>

          </form>

        ) : (
          // --- ERROR STATE (Preserved) ---
          <div className="p-24 text-center space-y-6 bg-slate-50/50">
            <div className="inline-flex p-4 rounded-full bg-red-50 text-red-600 font-mono text-xs font-black uppercase tracking-widest">
              Error: Data_Node_Not_Found
            </div>
            <p className="text-slate-400 font-medium max-w-xs mx-auto">
              The requested product ID does not exist in the current database cluster.
            </p>
            <Link
              href="/admin/products"
              className="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all"
            >
              Re-Sync Inventory
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}