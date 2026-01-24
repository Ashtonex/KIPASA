import { getNotificationSummary } from "@/actions/notification-actions"
import { Bell, Users, PackageSearch, TrendingUp, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { WaitlistModal } from "@/components/admin/WaitlistModal"

// Define the shape of our data for TypeScript safety
interface WaitlistGroup {
    id: string
    name: string
    image: string | null
    currentStock: number
    waitlistCount: number
    lastSent: string | null
    oldestRequest: string
}

export default async function NotificationDashboard() {
    const summary = await getNotificationSummary() as WaitlistGroup[]

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900">
                    <Bell className="text-blue-600 h-8 w-8 fill-blue-600/10" /> Restock Waitlist
                </h1>
                <p className="text-slate-500 font-medium">
                    Monitor demand for out-of-stock products in Mutare.
                </p>
            </header>

            {/* GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summary.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all relative overflow-hidden group"
                    >
                        {/* HIGH DEMAND BADGE */}
                        {item.waitlistCount >= 5 && (
                            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl flex items-center gap-1 shadow-sm z-10 animate-in slide-in-from-top-2">
                                <TrendingUp className="h-3 w-3" /> HIGH DEMAND
                            </div>
                        )}

                        {/* PRODUCT HEADER */}
                        <div className="flex gap-4 items-center mb-6">
                            <div className="h-20 w-20 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-inner relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.image || "/placeholder.png"}
                                    alt={item.name}
                                    className="object-cover h-full w-full grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 truncate text-lg leading-tight" title={item.name}>
                                    {item.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={item.currentStock > 0 ? "outline" : "destructive"} className="text-[9px] font-black px-2 py-0 border-2">
                                        {item.currentStock > 0 ? "IN STOCK" : "SOLD OUT"}
                                    </Badge>
                                    {item.currentStock > 0 && (
                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                            {item.currentStock} Available
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* STATS SECTION */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-end justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Requests</span>
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <Users className="h-5 w-5" />
                                        <span className="text-3xl font-black tracking-tighter leading-none">{item.waitlistCount}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Oldest Request</span>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(item.oldestRequest), { addSuffix: true })}
                                    </div>
                                </div>
                            </div>

                            {/* THE FIX: REMOVED 'count' and 'hasStock' to satisfy the build error */}
                            <WaitlistModal
                                productId={item.id}
                                productName={item.name}
                            />
                        </div>
                    </div>
                ))}

                {/* EMPTY STATE */}
                {summary.length === 0 && (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
                        <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PackageSearch className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Active Waitlists</h3>
                        <p className="font-medium text-slate-400 text-sm mt-1">Customers haven't requested any out-of-stock items yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}