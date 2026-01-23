import { createClient } from "@/lib/supabase/server"
import { OrdersClient } from "@/components/admin/OrdersClient"
import { Package, Banknote, Clock } from "lucide-react"

export const metadata = {
  title: "Order Management | Kipasa Admin",
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  // Fetch orders with shipping method info
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      shipping_methods (name)
    `)
    .order("id", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)

    return (
      <div className="p-10 text-center bg-red-50 rounded-[2rem] border border-red-100">
        <h2 className="text-red-600 font-black uppercase tracking-widest">
          Connection Interrupted
        </h2>
        <p className="text-red-400 text-sm font-mono mt-2">
          {error.message}
        </p>
      </div>
    )
  }

  // Telemetry calculations
  const pendingCash =
    orders?.filter((o) => o.status === "pending_cash").length || 0

  const totalProcessing =
    orders?.filter((o) => o.status === "paid" || o.status === "shipped").length ||
    0

  return (
    <div className="space-y-8 p-6 lg:p-10 bg-slate-50/50 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
            Logistics Pipeline
          </h1>
          <p className="text-slate-500 font-medium font-mono text-xs mt-1">
            System_Status:{" "}
            <span className="text-blue-600 tracking-widest uppercase">
              Fulfillment_Active
            </span>
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border shadow-sm flex items-center gap-2">
            <Banknote className="h-4 w-4 text-orange-500" />
            <span className="text-[10px] font-black uppercase text-slate-600">
              {pendingCash} Pending Cash
            </span>
          </div>

          <div className="bg-slate-900 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 text-white">
            <Package className="h-4 w-4 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {totalProcessing} Active Shipments
            </span>
          </div>
        </div>
      </div>

      {/* ================= ORDER ENGINE ================= */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border-none overflow-hidden transition-all">
        <OrdersClient initialOrders={orders || []} />
      </div>

      {/* ================= FOOTER NOTE ================= */}
      <div className="flex items-center gap-2 px-4 opacity-40">
        <Clock className="h-3 w-3" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
          Last Internal Sync: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}
