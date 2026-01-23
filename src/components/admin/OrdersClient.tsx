"use client"

import { useState } from "react"
import { updateOrderStatus } from "@/actions/admin-order-actions"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, CreditCard, User, Box, Search, Filter } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

type Order = {
    id: string
    created_at: string
    total_amount: number
    status: string
    customer_name?: string // Adjust based on your actual DB relations
    payment_method?: string
}

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    shipped: "bg-purple-100 text-purple-700 border-purple-200",
    delivered: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
}

export function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [filter, setFilter] = useState("")

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setLoadingId(orderId)
        try {
            await updateOrderStatus(orderId, newStatus)
            toast.success(`Order marked as ${newStatus}`)
        } catch (error) {
            toast.error("Failed to update status")
        } finally {
            setLoadingId(null)
        }
    }

    // Simple search filter
    const filteredOrders = initialOrders.filter(order =>
        order.id.toLowerCase().includes(filter.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(filter.toLowerCase())
    )

    return (
        <div className="space-y-6">

            {/* Search / Filter Bar */}
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    placeholder="Search by ID or Customer..."
                    className="flex-1 outline-none text-sm font-bold text-slate-700"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <Filter className="w-5 h-5 text-slate-400" />
            </div>

            {/* --- DESKTOP VIEW (Table) --- */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-black text-slate-500 uppercase text-xs">Order ID</th>
                            <th className="p-4 font-black text-slate-500 uppercase text-xs">Customer</th>
                            <th className="p-4 font-black text-slate-500 uppercase text-xs">Date</th>
                            <th className="p-4 font-black text-slate-500 uppercase text-xs">Total</th>
                            <th className="p-4 font-black text-slate-500 uppercase text-xs">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 font-mono text-slate-500">#{order.id.slice(0, 8)}</td>
                                <td className="p-4 font-bold text-slate-900">{order.customer_name || "Guest"}</td>
                                <td className="p-4 text-slate-500">{format(new Date(order.created_at), "MMM d, yyyy")}</td>
                                <td className="p-4 font-black text-slate-900">${order.total_amount.toFixed(2)}</td>
                                <td className="p-4">
                                    <StatusSelect
                                        status={order.status}
                                        isLoading={loadingId === order.id}
                                        onChange={(val) => handleStatusChange(order.id, val)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MOBILE VIEW (Cards) --- */}
            <div className="md:hidden space-y-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">

                        {/* Card Header */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                                    <Box className="w-3 h-3" />
                                    #{order.id.slice(0, 8)}
                                </div>
                                <h3 className="font-black text-slate-900 text-lg">{order.customer_name || "Guest Customer"}</h3>
                            </div>
                            <Badge className={STATUS_COLORS[order.status] || "bg-slate-100 text-slate-600"}>
                                {order.status}
                            </Badge>
                        </div>

                        {/* Card Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>{format(new Date(order.created_at), "MMM d")}</span>
                            </div>
                            <div className="flex items-center gap-2 font-black text-slate-900">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                                ${order.total_amount.toFixed(2)}
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="pt-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Update Status</label>
                            <StatusSelect
                                status={order.status}
                                isLoading={loadingId === order.id}
                                onChange={(val) => handleStatusChange(order.id, val)}
                                fullWidth
                            />
                        </div>

                    </div>
                ))}
            </div>
        </div>
    )
}

// Sub-component for the dropdown to keep code clean
function StatusSelect({ status, onChange, isLoading, fullWidth }: any) {
    return (
        <Select value={status} onValueChange={onChange} disabled={isLoading}>
            <SelectTrigger className={`h-9 bg-white border-slate-200 rounded-lg ${fullWidth ? 'w-full' : 'w-[140px]'}`}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
        </Select>
    )
}