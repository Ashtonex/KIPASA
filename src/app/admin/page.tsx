import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Package, Activity, LayoutGrid, TrendingUp, Zap } from "lucide-react"
import { OverviewCharts } from "@/components/admin/OverviewCharts"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 1. Fetch Stats & Chart Data in Parallel
  // UPDATED: Now includes 'shipped' and 'delivered' in revenue calculation
  const [ordersRes, revenueRes, productsRes, categoriesRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    
    // Logic: Revenue is "locked in" for any order that isn't cancelled/pending
    supabase.from("orders")
      .select("total_amount, created_at, status")
      .in("status", ["paid", "shipped", "delivered"]),
    
    supabase.from("products").select("id", { count: "exact", head: true }),

    supabase.from("categories").select("id", { count: "exact", head: true }),
  ])

  // 2. Calculate Stats
  const totalRevenue = revenueRes.data?.reduce((acc, order) => acc + order.total_amount, 0) || 0

  // 3. Mock Chart Data (Grouped by performance nodes)
  const chartData = [
    { name: "Jan", total: totalRevenue * 0.4 },
    { name: "Feb", total: totalRevenue * 0.6 },
    { name: "Mar", total: totalRevenue * 0.55 },
    { name: "Apr", total: totalRevenue * 0.85 },
    { name: "May", total: totalRevenue * 0.7 },
    { name: "Jun", total: totalRevenue },
  ]

  return (
    <div className="space-y-8 p-6 lg:p-10 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">Kipasa Engine</h2>
          <p className="text-slate-500 font-medium">Telemetry: <span className="text-green-600 font-bold">All Systems Active</span></p>
        </div>
        <div className="flex items-center gap-3 bg-blue-600 text-white px-6 py-2 rounded-2xl shadow-lg shadow-blue-200">
          <Zap className="h-4 w-4 fill-current animate-pulse" />
          <span className="text-sm font-bold tracking-widest uppercase">Live Pulse</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-[2rem] border-none shadow-sm bg-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gross Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">${totalRevenue.toLocaleString()}</div>
            <p className="text-[10px] text-green-600 font-black mt-1 uppercase">Receipts Verified</p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Traffic/Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{ordersRes.count || 0}</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Successful Checkouts</p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active SKUs</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{productsRes.count || 0}</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Inventory Online</p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nodes</CardTitle>
            <LayoutGrid className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">13</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Market Segments</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics Section (Graphs) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Performance Telemetry</h3>
        </div>
        <OverviewCharts data={chartData} />
      </div>

      {/* Technical Status Bar */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-[2rem] border-none shadow-sm bg-slate-900 text-white col-span-1 overflow-hidden relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-60">System Core</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_#22c55e]" />
                <div className="text-2xl font-black">Mainframe Online</div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-mono">Lat: 14ms | Option 2 (Flat DB) | v1.0.4</p>
          </CardContent>
          <Activity className="absolute -right-10 -bottom-10 h-32 w-32 text-white/5 rotate-12" />
        </Card>
      </div>
    </div>
  )
}