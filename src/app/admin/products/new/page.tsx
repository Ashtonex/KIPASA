import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/ProductForm"
import { ArrowLeft, PlusCircle, Activity } from "lucide-react"
import Link from "next/link"

export default async function NewProductPage() {
  const supabase = await createClient()

  // 1. Fetch categories from the database
  const { data: dbCategories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true })

  // 2. Transform the data into the { label, value } format to fix the blank dropdown
  // This ensures the map function in the ProductForm always finds a valid key
  const formattedCategories = dbCategories?.map((cat) => ({
    label: cat.name,
    value: cat.slug || cat.id.toString(), // Priority to slug, fallback to ID as string
  })) || []

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* High-Contrast Engine Header */}
      <div className="flex flex-col gap-2 border-b border-slate-50 pb-8">
        <Link 
          href="/admin/products" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all mb-2 group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
          Abort_to_Inventory
        </Link>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
          <PlusCircle className="w-8 h-8 text-blue-600" />
          Initialize_Product
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <Activity className="h-3 w-3 text-blue-600 animate-pulse" />
          <p className="text-slate-400 font-mono text-[9px] uppercase tracking-[0.3em]">
            System_Mode: <span className="text-blue-600">Creation_Interface_v1.0</span>
          </p>
        </div>
      </div>

      {/* Main Configuration Engine */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-100 overflow-hidden border-none transition-all">
        {/* Pass the formatted categories to satisfy the ProductForm requirement */}
        <ProductForm categories={formattedCategories} />
      </div>
    </div>
  )
}