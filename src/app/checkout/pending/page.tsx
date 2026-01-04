"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { checkPaymentStatus } from "@/actions/payment-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertCircle, XCircle, RefreshCcw, Smartphone, Activity } from "lucide-react"

// 1. Logic extracted to a sub-component to allow for Suspense wrapping
function PendingPaymentEngine() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  
  const [status, setStatus] = useState("pending") // pending | paid | failed
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!orderId || status === "failed" || status === "paid") return

    const interval = setInterval(async () => {
      const result = await checkPaymentStatus(orderId)
      
      if (result.status === "paid") {
        clearInterval(interval)
        setStatus("paid")
        setTimeout(() => router.push(`/checkout/success?orderId=${orderId}`), 2000)
      } else if (result.status === "failed") {
        clearInterval(interval)
        setStatus("failed")
      }
      
      setAttempts(prev => prev + 1)
    }, 5000)

    if (attempts > 60) {
      clearInterval(interval)
      setStatus("failed")
    }

    return () => clearInterval(interval)
  }, [orderId, attempts, router, status])

  return (
    <Card className={`border-none shadow-2xl rounded-[2.5rem] overflow-hidden transition-all duration-500 bg-white ${
      status === "failed" ? "ring-2 ring-red-500" : status === "paid" ? "ring-2 ring-green-500" : "ring-1 ring-slate-100"
    }`}>
      <CardHeader className="pt-10">
        <div className="flex justify-center mb-6">
          {status === "paid" ? (
            <CheckCircle2 className="h-20 w-20 text-green-500 animate-bounce" />
          ) : status === "failed" ? (
            <XCircle className="h-20 w-20 text-red-500 animate-pulse" />
          ) : (
            <div className="relative">
              <Loader2 className="h-20 w-20 text-blue-600 animate-spin" />
              <Smartphone className="h-7 w-7 text-slate-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          )}
        </div>
        <CardTitle className="text-3xl font-black uppercase tracking-tighter text-center">
          {status === "paid" ? "Payment_Verified" : status === "failed" ? "Sync_Failed" : "Auth_Required"}
        </CardTitle>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Activity className="h-3 w-3 text-blue-600 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Node_Status: {status.toUpperCase()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-10 px-8">
        {status === "failed" ? (
          <>
            <div className="bg-red-50 p-5 rounded-3xl border border-red-100 text-left">
              <p className="text-red-800 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Failure_Diagnostics
              </p>
              <ul className="text-xs text-red-700 space-y-2 font-medium">
                <li className="flex gap-2"><span>•</span> Insufficient wallet liquidity (EcoCash/OneMoney).</li>
                <li className="flex gap-2"><span>•</span> Incorrect security PIN input.</li>
                <li className="flex gap-2"><span>•</span> Handset timeout or manual cancellation.</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push('/checkout')} className="w-full bg-slate-900 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[11px] h-14 rounded-2xl transition-all">
                <RefreshCcw className="mr-2 h-4 w-4" /> Restart_Transaction
              </Button>
            </div>
          </>
        ) : status === "paid" ? (
          <p className="text-green-600 font-black uppercase tracking-widest text-xs text-center animate-pulse">
            Redirecting_to_Secure_Receipt...
          </p>
        ) : (
          <>
            <p className="text-slate-500 text-sm font-medium text-center px-4">
              A secure authorization prompt has been dispatched to your handset. Please enter your PIN.
            </p>
            <div className="bg-slate-50 p-6 rounded-3xl text-left border border-slate-100">
              <p className="font-black mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                Protocol_Instructions:
              </p>
              <ol className="space-y-3 text-slate-700 text-xs font-bold">
                <li className="flex gap-3 items-start">
                  <span className="bg-white border border-slate-200 w-5 h-5 rounded-md flex items-center justify-center shrink-0">1</span>
                  Unlock your mobile device.
                </li>
                <li className="flex gap-3 items-start">
                  <span className="bg-white border border-slate-200 w-5 h-5 rounded-md flex items-center justify-center shrink-0">2</span>
                  Verify the amount and enter your PIN.
                </li>
                <li className="flex gap-3 items-start">
                  <span className="bg-white border border-slate-200 w-5 h-5 rounded-md flex items-center justify-center shrink-0">3</span>
                  Keep this window active for auto-sync.
                </li>
              </ol>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// 2. Main export provides the boundary required by Next.js
export default function CheckoutPendingPage() {
  return (
    <div className="container max-w-lg mx-auto py-20 px-4 min-h-[80vh] flex items-center">
      <Suspense fallback={
        <Card className="w-full border-none shadow-2xl rounded-[2.5rem] p-20 text-center flex flex-col items-center gap-6">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initializing_Sync_Engine...</p>
        </Card>
      }>
        <PendingPaymentEngine />
      </Suspense>
    </div>
  )
}