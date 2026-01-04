import { getCustomers } from "@/actions/admin-customer-actions"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { User, DollarSign, Shield, Globe, Activity } from "lucide-react"

export const metadata = { title: "Admin | Customer Nodes" }

export default async function AdminCustomersPage() {
  const customers = await getCustomers()

  // Constants for inactivity logic
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return (
    <div className="space-y-8 p-6 lg:p-10 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
            Customer Nodes
          </h2>
          <p className="text-slate-500 font-medium font-mono text-xs mt-1">
            Network Population: <span className="text-blue-600">{customers.length} Active Entities</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-lg shadow-slate-200">
          <Activity className="h-4 w-4 text-green-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">Telemetry Active</span>
        </div>
      </div>

      {/* Modern Table Container */}
      <div className="rounded-[2.5rem] overflow-hidden border-none shadow-2xl bg-white">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-900 hover:bg-slate-900 border-none">
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Identity & Contact
                </TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Pulse Status
                </TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Location Hash
                </TableHead>
                <TableHead className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Lifetime Value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {customers.map((user) => {
                // Determine if user is inactive (No orders in 30 days or never ordered)
                const isInactive = !user.lastOrderDate || new Date(user.lastOrderDate) < thirtyDaysAgo;

                return (
                  <tr key={user.id} className="group hover:bg-blue-50/30 transition-all">
                    {/* Name & Email with User Icon */}
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 uppercase tracking-tight">
                            {user.name}
                          </span>
                          <span className="text-xs text-slate-500 font-mono tracking-tighter">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* DYNAMIC STATUS PULSE */}
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full animate-pulse ${
                          isInactive 
                            ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' 
                            : 'bg-green-500 shadow-[0_0_10px_#22c55e]'
                        }`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          isInactive ? 'text-red-500' : 'text-slate-400'
                        }`}>
                          {isInactive ? 'Node_Inactive' : `${user.role || 'user'}_Active`}
                        </span>
                      </div>
                    </TableCell>

                    {/* Location Info */}
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-600 font-mono">
                        <Globe className="h-3 w-3 opacity-40 text-blue-500" />
                        <span className="text-xs font-bold uppercase tracking-tight">
                          {user.city || "Origin_Unknown"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Total Spend - High Contrast */}
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-slate-900">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-xl font-black tracking-tighter">
                            {user.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {user.orderCount} Transmissions
                        </span>
                      </div>
                    </TableCell>
                  </tr>
                );
              })}

              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                      <Shield className="h-8 w-8 text-slate-400" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                        No active nodes detected in the network.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}