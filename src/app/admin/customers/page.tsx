import { getCustomers } from "@/actions/admin-customer-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { User, DollarSign, Shield, Globe, Activity, MapPin, CreditCard } from "lucide-react"

export const metadata = { title: "Admin | Customer Nodes" }

export default async function AdminCustomersPage() {
  const customers = await getCustomers()

  // Constants for inactivity logic
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-10 bg-slate-50/50 min-h-screen">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-slate-900 uppercase">
            Customer Nodes
          </h2>
          <p className="text-slate-500 font-medium font-mono text-xs mt-1">
            Network Population: <span className="text-blue-600">{customers.length} Active Entities</span>
          </p>
        </div>
        <div className="self-start md:self-auto flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-lg shadow-slate-200">
          <Activity className="h-4 w-4 text-green-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">Telemetry Active</span>
        </div>
      </div>

      {/* --- DESKTOP VIEW (Table) --- */}
      <div className="hidden md:block rounded-[2.5rem] overflow-hidden border-none shadow-2xl bg-white">
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
                const isInactive = !user.lastOrderDate || new Date(user.lastOrderDate) < thirtyDaysAgo;

                return (
                  <tr key={user.id} className="group hover:bg-blue-50/30 transition-all">
                    {/* Name & Email */}
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

                    {/* Status */}
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full animate-pulse ${isInactive
                          ? 'bg-red-500 shadow-[0_0_10px_#ef4444]'
                          : 'bg-green-500 shadow-[0_0_10px_#22c55e]'
                          }`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isInactive ? 'text-red-500' : 'text-slate-400'
                          }`}>
                          {isInactive ? 'Node_Inactive' : `${user.role || 'user'}_Active`}
                        </span>
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-600 font-mono">
                        <Globe className="h-3 w-3 opacity-40 text-blue-500" />
                        <span className="text-xs font-bold uppercase tracking-tight">
                          {user.city || "Origin_Unknown"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Spend */}
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
            </TableBody>
          </Table>
        </div>
      </div>

      {/* --- MOBILE VIEW (Cards) --- */}
      <div className="md:hidden space-y-4">
        {customers.map((user) => {
          const isInactive = !user.lastOrderDate || new Date(user.lastOrderDate) < thirtyDaysAgo;
          return (
            <div key={user.id} className="bg-white p-5 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
              {/* Status Indicator Bar */}
              <div className={`absolute top-0 left-0 w-1 h-full ${isInactive ? 'bg-red-500' : 'bg-green-500'}`} />

              {/* Header */}
              <div className="flex justify-between items-start mb-4 pl-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase text-sm">{user.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400">{user.email}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isInactive
                  ? 'bg-red-50 text-red-600 border-red-100'
                  : 'bg-green-50 text-green-600 border-green-100'
                  }`}>
                  {isInactive ? 'Inactive' : 'Active'}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 pl-3">
                {/* Location */}
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-blue-500" />
                    <span className="text-xs font-bold text-slate-700">{user.city || "Unknown"}</span>
                  </div>
                </div>

                {/* Spend */}
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">LTV</span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-black text-slate-900">
                      {user.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </span>
                    <span className="text-[9px] text-slate-400 ml-1">({user.orderCount})</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {customers.length === 0 && (
        <div className="p-10 md:h-40 text-center flex flex-col items-center justify-center space-y-2 opacity-30 bg-white rounded-3xl border border-dashed border-slate-200">
          <Shield className="h-8 w-8 text-slate-400" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            No active nodes detected in the network.
          </p>
        </div>
      )}

    </div>
  )
}