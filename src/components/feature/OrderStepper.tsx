"use client"

import { Check, Package, Truck, Home, CreditCard } from "lucide-react"

// Define the logical order of steps
const STEPS = [
  { id: "pending", label: "Order Placed", icon: Package },
  { id: "paid", label: "Payment Confirmed", icon: CreditCard },
  { id: "shipped", label: "Out for Delivery", icon: Truck },
  { id: "delivered", label: "Delivered", icon: Home },
]

export function OrderStepper({ status }: { status: string }) {
  // 1. Determine current step index
  // If status is "cancelled", we handle it separately or just show 0 progress
  const getCurrentStepIndex = (status: string) => {
    switch (status) {
      case "pending": return 0
      case "paid": return 1
      case "shipped": return 2
      case "delivered": return 3
      default: return 0
    }
  }

  const currentStepIndex = getCurrentStepIndex(status)
  const isCancelled = status === "cancelled"

  if (isCancelled) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-red-600 border border-red-100">
        <p className="font-semibold">This order has been cancelled.</p>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* Progress Bar Background Line */}
      <div className="absolute left-0 top-5 h-1 w-full -translate-y-1/2 bg-muted md:top-6" />
      
      {/* Active Progress Line */}
      <div 
        className="absolute left-0 top-5 h-1 -translate-y-1/2 bg-primary transition-all duration-500 md:top-6"
        style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }} 
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index <= currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              {/* Circle */}
              <div 
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-colors duration-300 md:h-12 md:w-12
                  ${isCompleted ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground"}
                  ${isCurrent ? "ring-4 ring-primary/20" : ""}
                `}
              >
                {index < currentStepIndex ? (
                  <Check className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </div>
              
              {/* Label */}
              <span 
                className={`text-[10px] font-medium uppercase tracking-wider text-center md:text-xs
                  ${isCompleted ? "text-foreground" : "text-muted-foreground"}
                `}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}