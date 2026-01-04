import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XCircle, RefreshCw, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrderCancelPage() {
  return (
    <div className="container flex min-h-[600px] flex-col items-center justify-center py-10">
      <Card className="w-full max-w-md text-center border-red-100 shadow-lg">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 animate-in zoom-in duration-300">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            It looks like you cancelled the payment or the transaction failed. No funds were deducted.
          </p>
          
          <div className="rounded-lg bg-red-50 p-4 border border-red-100 text-sm text-red-800">
            <p>If you experienced a network issue with EcoCash/OneMoney, please wait a moment and try again.</p>
          </div>

          <div className="space-y-3 pt-2">
            <Button asChild className="w-full" size="lg">
              <Link href="/checkout">
                <RefreshCw className="mr-2 h-4 w-4" /> Retry Payment
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="w-full">
              <Link href="/products">
                <ShoppingCart className="mr-2 h-4 w-4" /> Return to Store
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}