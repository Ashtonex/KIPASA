"use client"

import { useState } from "react"
import { getProductWaitlistEmails } from "@/actions/notification-actions"
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, Clock, ArrowRight, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function WaitlistModal({ productId, productName }: { productId: string, productName: string }) {
  const [emails, setEmails] = useState<{ email: string, created_at: string }[]>([])
  const [loading, setLoading] = useState(false)

  const fetchEmails = async () => {
    setLoading(true)
    const data = await getProductWaitlistEmails(productId)
    setEmails(data)
    setLoading(false)
  }

  return (
    <Dialog onOpenChange={(open) => open && fetchEmails()}>
      <DialogTrigger asChild>
        <button className="w-full bg-gray-50 hover:bg-black hover:text-white text-gray-600 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20">
          View Customer Emails <ArrowRight className="h-3 w-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tight">
            Waitlist for {productName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 mt-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : emails.length > 0 ? (
            emails.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{entry.email}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(entry.created_at))} ago
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10 text-muted-foreground italic">No active requests found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}