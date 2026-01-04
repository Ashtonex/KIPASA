import { getNotificationSummary } from "@/actions/notification-actions"
import { Bell, Users, PackageSearch, TrendingUp, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { WaitlistModal } from "@/components/admin/WaitlistModal"

export default async function NotificationDashboard() {
  const summary: any = await getNotificationSummary()

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-gray-900">
          <Bell className="text-primary h-8 w-8" /> Restock Waitlist
        </h1>
        <p className="text-muted-foreground font-medium">Monitor demand for out-of-stock products in Mutare.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summary.map((item: any) => (
          <div key={item.id} className="bg-white border rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
            {item.waitlistCount >= 5 && (
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl flex items-center gap-1 shadow-sm z-10">
                <TrendingUp className="h-3 w-3" /> HIGH DEMAND
              </div>
            )}
            
            <div className="flex gap-4 items-center mb-6">
              <div className="h-20 w-20 rounded-2xl overflow-hidden border bg-gray-50 flex-shrink-0 shadow-inner">
                <img 
                  src={item.image || "/placeholder.png"} 
                  alt="" 
                  className="object-cover h-full w-full grayscale group-hover:grayscale-0 transition-all duration-500" 
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate text-lg leading-tight">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={item.currentStock > 0 ? "outline" : "destructive"} className="text-[9px] font-black px-2 py-0">
                    {item.currentStock > 0 ? "IN STOCK" : "SOLD OUT"}
                  </Badge>
                  <span className="text-[11px] font-bold text-muted-foreground">Qty: {item.currentStock}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Waitlist</span>
                  <div className="flex items-center gap-2 text-primary">
                    <Users className="h-5 w-5" />
                    <span className="text-3xl font-black tracking-tighter leading-none">{item.waitlistCount}</span>
                  </div>
                </div>

                {item.lastSent && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Alert</span>
                    <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(item.lastSent), { addSuffix: true }).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
              
              <WaitlistModal productId={item.id} productName={item.name} />
            </div>
          </div>
        ))}

        {summary.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/50">
            <PackageSearch className="h-16 w-16 mx-auto text-gray-200 mb-4" />
            <p className="font-black text-gray-400 uppercase tracking-widest text-sm">No restock requests found</p>
          </div>
        )}
      </div>
    </div>
  )
}