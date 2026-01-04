import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/ProductForm"
import { ArrowLeft, Package, ShieldCheck } from "lucide-react"
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

  // 3. Concurrent Fetch: Get Product and Categories to fix the build error
  const [productResult, categoriesResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("name", { ascending: true })
  ])

  const { data: product } = productResult
  const { data: categories } = categoriesResult

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* High-Tech Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-8">
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

        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Node_ID: <span className="text-slate-900">{id.slice(0, 8)}</span>
          </span>
        </div>
      </div>

      {/* Main Configuration Engine */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-100 overflow-hidden border-none transition-all">
        {product ? (
          // FIX: Added categories prop to satisfy the ProductForm interface
          <ProductForm product={product} categories={categories || []} />
        ) : (
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