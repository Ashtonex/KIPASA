import { createClient } from "@/lib/supabase/server"
import { ShippingManager } from "@/components/admin/ShippingManager"
import { Settings, ShieldCheck, Power, Globe } from "lucide-react"

export const metadata = { title: "Admin | System Settings" }

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  // Fetch Shipping Methods
  const { data: shippingMethods } = await supabase
    .from("shipping_methods")
    .select("*")
    .order("price", { ascending: true })

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 min-h-screen bg-slate-50/50">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg shadow-slate-200">
          <Settings className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">
            System Controls
          </h1>
          <p className="text-slate-500 font-medium text-xs md:text-sm">
            Configure global store parameters
          </p>
        </div>
      </div>

      {/* --- SHIPPING CONFIGURATION --- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Globe className="w-4 h-4" /> Logistics Grid
          </h2>
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
            ACTIVE
          </span>
        </div>

        {/* The Interactive Manager Component */}
        <ShippingManager methods={shippingMethods || []} />
      </section>

      {/* --- GENERAL INFO (Read Only for now) --- */}
      <section className="space-y-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
          <ShieldCheck className="w-4 h-4" /> Instance Metadata
        </h2>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Store Identity</label>
              <div className="font-bold text-slate-900 text-lg">Kipasa Store</div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Operating Currency</label>
              <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                USD <span className="text-slate-300 text-sm">($)</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Environment</label>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                <span className="font-mono font-bold text-sm text-slate-700">Production (Vercel)</span>
              </div>
            </div>
          </div>

          {/* Danger Zone Placeholder */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest hover:text-red-600 transition-colors opacity-60 hover:opacity-100">
              <Power className="w-4 h-4" /> Restart System Services
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}