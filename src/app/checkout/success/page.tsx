import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, MapPin, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // NEXT.JS 15 FIX: searchParams must be awaited
  const resolvedParams = await searchParams;
  const orderId = typeof resolvedParams.orderId === "string" ? resolvedParams.orderId : "N/A"
  const isPaymentPending = resolvedParams.payment === "pending"

  return (
    <div className="container flex min-h-[600px] flex-col items-center justify-center py-10 mx-auto">
      <Card className="w-full max-w-md text-center border-green-100 shadow-lg">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">Order Received!</CardTitle>
          {isPaymentPending && (
             <p className="text-sm font-medium text-amber-600 bg-amber-50 py-1 px-3 rounded-full mx-auto mt-2 inline-block">
               Payment Pending Confirmation
             </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Thank you for your purchase. {isPaymentPending 
              ? "We are currently waiting for payment confirmation from Paynow." 
              : "Your order has been confirmed and is being processed."}
          </p>
          
          <div className="rounded-lg bg-muted/50 p-4 border border-dashed">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order Reference</p>
            <p className="font-mono text-xl font-bold tracking-widest text-primary mt-1">
              {orderId !== "N/A" ? orderId.slice(0, 8).toUpperCase() : "REF-ERROR"}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button asChild className="w-full" size="lg">
              <Link href={`/orders/${orderId}/track`}>
                <MapPin className="mr-2 h-4 w-4" /> Track Order Status
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/products">
                Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}