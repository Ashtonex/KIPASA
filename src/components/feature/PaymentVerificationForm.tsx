"use client"

import { useState } from "react"
import { updateOrderPaymentCode } from "@/actions/order-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, CheckCircle2 } from "lucide-react"

export function PaymentVerificationForm({ orderId }: { orderId: string }) {
    const [code, setCode] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) return

        setIsSubmitting(true)
        try {
            const result = await updateOrderPaymentCode(orderId, code.trim())
            if (result.success) {
                setIsSuccess(true)
                toast.success("Confirmation code submitted successfully!")
            } else {
                toast.error("Failed to update confirmation code. Please try again.")
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="bg-green-50/50 border border-green-100 p-6 rounded-2xl flex flex-col items-center text-center animate-in zoom-in duration-300">
                <CheckCircle2 className="h-10 w-10 text-green-600 mb-2" />
                <p className="text-sm font-black uppercase text-green-800 tracking-tight">Verification Received</p>
                <p className="text-[10px] text-green-600 mt-1 uppercase font-bold">Our team has been notified, sir.</p>
            </div>
        )
    }

    return (
        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
            <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight mb-2">EcoCash Verification</h3>
            <p className="text-[10px] text-blue-700 mb-4 leading-relaxed font-bold uppercase tracking-tight">
                Once you receive your EcoCash confirmation message, please enter the code below to expedite your order processing.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    placeholder="Confirmation Code..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="rounded-xl border-blue-200 bg-white shadow-sm font-mono text-sm placeholder:italic"
                    disabled={isSubmitting}
                />
                <Button
                    type="submit"
                    disabled={isSubmitting || !code.trim()}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                </Button>
            </form>
        </div>
    )
}
