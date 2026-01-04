"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { checkPaymentStatus } from "@/actions/payment-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertCircle, XCircle, RefreshCcw, Smartphone } from "lucide-react"

export default function CheckoutPendingPage() {
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
      setStatus("failed") // Timeout is treated as a failure
    }

    return () => clearInterval(interval)
  }, [orderId, attempts, router, status])

  return (
    <div className="container max-w-lg mx-auto py-20 px-4">
      <Card className={`border-2 shadow-xl text-center transition-colors duration-500 ${
        status === "failed" ? "border-red-500/50" : status === "paid" ? "border-green-500/50" : "border-yellow-400/50"
      }`}>
        <CardHeader>
          <div className="flex justify-center mb-4">
            {status === "paid" ? (
              <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
            ) : status === "failed" ? (
              <XCircle className="h-16 w-16 text-red-500 animate-pulse" />
            ) : (
              <div className="relative">
                <Loader2 className="h-16 w-16 text-yellow-500 animate-spin" />
                <Smartphone className="h-6 w-6 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "paid" ? "Payment Confirmed!" : status === "failed" ? "Transaction Failed" : "Check Your Phone"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === "failed" ? (
            <>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-left">
                <p className="text-red-800 text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Why did it fail?
                </p>
                <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                  <li>Insufficient funds in your EcoCash/OneMoney wallet.</li>
                  <li>Incorrect PIN entered on your handset.</li>
                  <li>The transaction was timed out or cancelled.</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push('/checkout')} className="w-full bg-red-600 hover:bg-red-700">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Try Different Method
                </Button>
                <Button variant="ghost" onClick={() => window.location.reload()} className="text-xs text-gray-500">
                  Restart Polling
                </Button>
              </div>
            </>
          ) : status === "paid" ? (
            <p className="text-green-600 font-bold">Taking you to your receipt...</p>
          ) : (
            <>
              <p className="text-gray-600 font-medium">
                We've sent a payment prompt to your phone. Enter your PIN to authorize.
              </p>
              <div className="bg-muted p-4 rounded-lg text-sm text-left border-l-4 border-yellow-500">
                <p className="font-bold mb-1 flex items-center gap-2 text-xs uppercase tracking-wider">
                  Instructions:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700 text-xs">
                  <li>Unlock your phone screen.</li>
                  <li>Enter your <strong>EcoCash/OneMoney PIN</strong>.</li>
                  <li>Stay on this page—it will update automatically.</li>
                </ol>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}