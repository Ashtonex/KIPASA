"use client"

import { useState } from "react"
import { updateOrderStatus, confirmCashPayment } from "@/actions/admin-order-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, Package, CheckCircle2, Banknote, Loader2, MoreHorizontal, AlertCircle } from "lucide-react"
import { toast } from "sonner"

type Order = {
  id: string
  created_at: string
  status: string
  payment_method: string
  total_amount: number
  shipping_method_id: number
  contact_phone: string
  first_name: string
  last_name: string
  shipping_address: string
  shipping_city: string
  tracking_number?: string
  courier_name?: string
  shipping_methods: { name: string }
}

const STATUS_CONFIG: any = {
  pending: { color: "bg-slate-500", label: "Awaiting_Payment" },
  pending_cash: { color: "bg-orange-500 shadow-[0_0_8px_#f97316]", label: "Cash_Collection" },
  paid: { color: "bg-blue-600 shadow-[0_0_8px_#2563eb]", label: "System_Verified" },
  shipped: { color: "bg-purple-600", label: "In_Transit" },
  delivered: { color: "bg-green-600", label: "Finalized" },
  cancelled: { color: "bg-red-600", label: "Terminated" },
}

export function AdminOrderList({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState("all")
  const [isVerifying, setIsVerifying] = useState<string | null>(null)

  const filteredOrders = orders.filter((order) => 
    filter === "all" ? true : order.status === filter
  )

  const handleConfirmCash = async (orderId: string) => {
    if (!confirm("Confirm physical cash receipt for this node?")) return
    setIsVerifying(orderId)
    const result = await confirmCashPayment(orderId)
    if (result.success) {
      toast.success("REVENUE LOCKED: Order marked as PAID")
    } else {
      toast.error("Process Failed: " + result.message)
    }
    setIsVerifying(null)
  }

  return (
    <div className="space-y-6">
      {/* High-Tech Filter Tabs */}
      <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
        {["all", "pending_cash", "paid", "shipped", "delivered"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className={`capitalize rounded-xl font-black text-[10px] tracking-widest ${
              filter === status ? 'bg-slate-900 text-white' : 'text-slate-500'
            }`}
          >
            {status.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-[2rem] border-none bg-white shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="p-6">Node_ID</th>
              <th className="p-6">Identity</th>
              <th className="p-6">Telemetry_Status</th>
              <th className="p-6">Value</th>
              <th className="p-6 text-right">Fulfillment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-6 font-mono text-[10px] text-slate-400">
                  {order.id.slice(0, 8)}...
                </td>
                <td className="p-6">
                  <div className="font-black text-slate-900 uppercase tracking-tighter">
                    {order.first_name} {order.last_name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{order.payment_method}_GATEWAY</div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${STATUS_CONFIG[order.status]?.color}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {STATUS_CONFIG[order.status]?.label}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                   <div className="text-lg font-black text-slate-900 tracking-tighter">
                     ${order.total_amount.toFixed(2)}
                   </div>
                </td>
                <td className="p-6 text-right space-x-2">
                  {/* Revenue Confirmation for COD */}
                  {order.status === 'pending_cash' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleConfirmCash(order.id)}
                      disabled={isVerifying === order.id}
                      className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-[9px] uppercase tracking-widest h-8"
                    >
                      {isVerifying === order.id ? <Loader2 className="animate-spin h-3 w-3" /> : <Banknote className="h-3 w-3 mr-1" />}
                      Verify Cash
                    </Button>
                  )}
                  <UpdateStatusModal order={order} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
            No data nodes detected in this sector.
          </div>
        )}
      </div>
    </div>
  )
}

function UpdateStatusModal({ order }: { order: any }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-8 border-slate-200">
          Manage_Node
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tighter text-2xl">Node Control #{order.id.slice(0, 8)}</DialogTitle>
        </DialogHeader>
        
        <form action={async (formData) => {
            await updateOrderStatus(formData)
            toast.success("TELEMETRY UPDATED")
            setOpen(false) 
        }} className="grid gap-6 py-4">
          
          <input type="hidden" name="orderId" value={order.id} />

          <div className="grid gap-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Logistics State</Label>
            <Select name="status" defaultValue={order.status}>
              <SelectTrigger className="rounded-xl font-bold">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="rounded-xl font-bold">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="pending_cash">Pending Cash (COD)</SelectItem>
                <SelectItem value="paid">Paid (Verified)</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carrier_ID</Label>
            <Input name="courierName" defaultValue={order.courier_name || ""} placeholder="e.g. Swift / Bike / Fedex" className="rounded-xl font-bold" />
          </div>

          <div className="grid gap-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tracking_Hash</Label>
            <Input name="trackingNumber" defaultValue={order.tracking_number || ""} placeholder="e.g. TRK-990022" className="rounded-xl font-mono text-sm" />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full rounded-xl bg-slate-900 font-black uppercase tracking-widest py-6 shadow-lg shadow-slate-200">
              Apply System Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}