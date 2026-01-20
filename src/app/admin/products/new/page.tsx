import { createClient } from "@/lib/supabase/server"
import { createProduct } from "@/actions/product-actions"
import { ArrowLeft, PlusCircle, Activity, Save, UploadCloud } from "lucide-react"
import Link from "next/link"

export default async function NewProductPage() {
  const supabase = await createClient()

  // 1. Fetch categories from the database
  const { data: dbCategories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">

      {/* --- High-Contrast Engine Header (Preserved) --- */}
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-8">
        <Link
          href="/admin/products"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all mb-2 group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Abort_to_Inventory
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
            <PlusCircle className="w-8 h-8 text-blue-600" />
            Initialize_Product
          </h1>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <Activity className="h-3 w-3 text-blue-600 animate-pulse" />
          <p className="text-slate-400 font-mono text-[9px] uppercase tracking-[0.3em]">
            System_Mode: <span className="text-blue-600">Creation_Interface_v1.0</span>
          </p>
        </div>
      </div>

      {/* --- Main Configuration Engine (The Working Form) --- */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 transition-all p-8">

        <form action={createProduct} className="space-y-8">

          {/* 1. Product Name (Full Width) */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Product Name</label>
            <input
              name="name"
              required
              placeholder="e.g. Wireless Headphones"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
            />
          </div>

          {/* 2. Price & Stock (Grid Layout) */}
          <div className="grid gap-8 md:grid-cols-2">

            {/* Price */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* --- NEW: Stock Level --- */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Initial Stock</label>
              <input
                name="stock"
                type="number"
                required
                placeholder="0"
                defaultValue="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* 3. Category Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-blue-600 flex items-center gap-2">
              Category Classification
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[9px]">CRITICAL</span>
            </label>
            <div className="relative">
              <select
                name="category_id"
                className="w-full appearance-none bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer hover:bg-blue-50 transition-all"
                defaultValue="14"
              >
                <option value="14">General / Uncategorized (Safe Default)</option>
                {dbCategories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} (ID: {cat.id})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              * Ensures product doesn't disappear into 'NULL' category.
            </p>
          </div>

          {/* 4. Description */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Description</label>
            <textarea
              name="description"
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* 5. Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Product Image</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-all group cursor-pointer relative">
              <input type="file" name="image" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                </div>
                <p className="text-sm font-bold text-slate-400 group-hover:text-slate-600">Click to upload image</p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            <Save className="w-4 h-4" />
            Launch to Market
          </button>

        </form>
      </div>
    </div>
  )
}