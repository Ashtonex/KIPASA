"use client"

import { useCart } from "@/context/CartContext"
import { placeOrder } from "@/actions/order-actions"
import { initiatePayment } from "@/actions/payment-actions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
// Added Activity to the imports to fix your Runtime Error
import { Loader2, AlertCircle, CreditCard, Wallet, Landmark, Info, Banknote, Activity } from "lucide-react"

type ShippingMethod = {
  id: number
  name: string
  price: number
  description: string
  estimated_days: string
}

export function CheckoutForm({ shippingMethods }: { shippingMethods: ShippingMethod[] }) {
  const router = useRouter()
  const { items, cartTotal } = useCart()
  
  // State Management
  const [selectedMethod, setSelectedMethod] = useState<string>(shippingMethods[0]?.id.toString())
  const [paymentMethod, setPaymentMethod] = useState<string>("mobile") 
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  // Calculations
  const shippingCost = shippingMethods.find(m => m.id.toString() === selectedMethod)?.price || 0
  const finalTotal = cartTotal + shippingCost

  // Zimbabwe Phone Validation (EcoCash/OneMoney)
  const validateZimPhone = (phone: string) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "")
    const zimRegex = /^(\+?263|0)7[1378][0-9]{7}$/
    return zimRegex.test(cleanPhone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setPhoneError(null)

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const phone = formData.get("phone") as string
      const email = formData.get("email") as string

      // 1. Validate Phone if Mobile Payment is selected
      if (paymentMethod === "mobile" && !validateZimPhone(phone)) {
        setPhoneError("Invalid EcoCash/OneMoney number. Use 077... or +263...")
        setIsSubmitting(false)
        return
      }

      // 2. Create Order in Supabase
      const result = await placeOrder({
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: email,
        phone: phone,
        address: formData.get("address") as string,
        city: formData.get("city") as string,
        suburb: formData.get("suburb") as string,
        shippingMethodId: Number(selectedMethod),
        paymentMethod: paymentMethod, 
        cartItems: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      })

      if (result.success && result.orderId) {
        // 3. Handle Logic based on Payment Method
        if (paymentMethod === "cod") {
          localStorage.removeItem("cart")
          router.push(`/checkout/success?orderId=${result.orderId}&method=cod`)
        } else {
          const paymentResult = await initiatePayment(
            result.orderId, 
            email, 
            paymentMethod, 
            phone
          )

          if (paymentResult.success) {
            localStorage.removeItem("cart")
            if (paymentMethod === "mobile") {
               router.push(`/checkout/pending?orderId=${result.orderId}`)
            } else if (paymentResult.redirectUrl) {
               window.location.href = paymentResult.redirectUrl
            }
          } else {
            alert("Payment could not be started: " + (paymentResult.error || "Unknown error"))
          }
        }
      }
    } catch (error) {
      console.error(error)
      alert("Something went wrong. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-xl font-black uppercase tracking-widest text-slate-400">Your cart is empty.</p>
        <Button onClick={() => router.push("/products")} className="rounded-2xl font-black uppercase tracking-widest">Start Shopping</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
      
      {/* LEFT COLUMN: Customer & Shipping Details */}
      <div className="space-y-6">
        <Card className="rounded-[2rem] border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-900">Identity & Node Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName" className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">First Name</Label>
                <Input id="firstName" name="firstName" placeholder="John" required className="rounded-xl border-slate-100 bg-slate-50/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName" className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Last Name</Label>
                <Input id="lastName" name="lastName" placeholder="Doe" required className="rounded-xl border-slate-100 bg-slate-50/50" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Transmission Email</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" required className="rounded-xl border-slate-100 bg-slate-50/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Phone (Required for Mobile/COD)</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                placeholder="077..." 
                required 
                className={`rounded-xl border-slate-100 bg-slate-50/50 ${phoneError ? "border-red-500 ring-1 ring-red-500" : ""}`}
                onChange={() => setPhoneError(null)}
              />
              {phoneError && (
                <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1 font-black uppercase tracking-tighter">
                  <AlertCircle className="h-3 w-3" /> {phoneError}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PAYMENT METHOD SELECTOR */}
        <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 pb-4">
            <CardTitle className="text-lg font-black uppercase tracking-widest text-white">Payment Protocol</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-3">
              <div>
                <RadioGroupItem value="mobile" id="mobile" className="peer sr-only" />
                <Label
                  htmlFor="mobile"
                  className="flex flex-col items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 cursor-pointer transition-all h-full"
                >
                  <Wallet className="mb-2 h-6 w-6 text-green-600" />
                  <span className="text-[9px] font-black uppercase text-center tracking-tighter">Mobile Money</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                <Label
                  htmlFor="card"
                  className="flex flex-col items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 cursor-pointer transition-all h-full"
                >
                  <CreditCard className="mb-2 h-6 w-6 text-blue-600" />
                  <span className="text-[9px] font-black uppercase text-center tracking-tighter">Card Gateway</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                <Label
                  htmlFor="cod"
                  className="flex flex-col items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 cursor-pointer transition-all h-full"
                >
                  <Banknote className="mb-2 h-6 w-6 text-orange-600" />
                  <span className="text-[9px] font-black uppercase text-center tracking-tighter">Cash On Delivery</span>
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === "cod" && (
              <div className="mt-4 p-4 bg-orange-50 rounded-2xl flex gap-3 items-start border border-orange-100 animate-in fade-in slide-in-from-top-2">
                <Info className="h-4 w-4 text-orange-600 mt-0.5" />
                <p className="text-[10px] text-orange-800 leading-relaxed font-bold uppercase tracking-tighter">
                  Order processed immediately. Ensure <b>USD</b> cash is available for the logistics partner.
                </p>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="mt-4 p-4 bg-blue-50 rounded-2xl flex gap-3 items-start border border-blue-100 animate-in fade-in slide-in-from-top-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-[10px] text-blue-800 leading-relaxed font-bold uppercase tracking-tighter">
                  Secure redirect to Paynow. Transmission is encrypted; no card data is retained locally.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-900">Destination Geometry</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Street Address</Label>
              <Input id="address" name="address" placeholder="123 Main Street" required className="rounded-xl border-slate-100 bg-slate-50/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city" className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">City</Label>
                <Input id="city" name="city" placeholder="Mutare" defaultValue="Mutare" required className="rounded-xl border-slate-100 bg-slate-50/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="suburb" className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Area Code / Suburb</Label>
                <Input id="suburb" name="suburb" placeholder="Murambi" required className="rounded-xl border-slate-100 bg-slate-50/50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Summary & Confirmation */}
      <div className="space-y-6">
        <Card className="sticky top-24 border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="bg-slate-900 text-white">
            <CardTitle className="text-xl font-black uppercase tracking-widest">System Receipt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="font-black text-slate-700 uppercase tracking-tighter">{item.name} <span className="text-slate-400 text-[10px] ml-1">v{item.quantity}</span></span>
                  <span className="font-black text-slate-900 tracking-tighter">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Logistics Priority</Label>
              <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-2">
                {shippingMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2 border-2 border-slate-50 p-4 rounded-2xl transition-all hover:border-blue-600/20 bg-slate-50/30">
                    <RadioGroupItem value={method.id.toString()} id={`ship-${method.id}`} />
                    <Label htmlFor={`ship-${method.id}`} className="flex-1 flex justify-between cursor-pointer items-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-black uppercase text-slate-800 tracking-tighter">{method.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono uppercase font-bold">{method.estimated_days}</span>
                      </div>
                      <span className="font-black text-slate-900 tracking-tighter">${method.price.toFixed(2)}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                <span>Core Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                <span>Shipping Overhead</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-3xl font-black border-t-2 border-slate-900 pt-4 text-slate-900">
                <span className="tracking-tighter uppercase">Total_Due</span>
                <span className="tracking-tighter">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className={`w-full h-16 text-lg font-black rounded-2xl shadow-xl transition-all transform active:scale-[0.98] ${
                paymentMethod === 'cod' ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-100' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
              }`}
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <Activity className="mr-2 h-6 w-6" /> // This is now defined
              )}
              {isSubmitting ? "PROCESSING_NODE..." : paymentMethod === 'cod' ? "INITIALIZE COD ORDER" : "EXECUTE PAYMENT"}
            </Button>
            
            <div className="flex items-center justify-center gap-3 mt-4 opacity-30">
                <img src="/paynow-badge.png" alt="Paynow" className="h-5 grayscale" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Encrypted_Payload</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}