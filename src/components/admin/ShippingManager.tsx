"use client"

import { useState } from "react"
import { updateShippingMethod } from "@/actions/settings-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Save, Truck, AlertCircle, CheckCircle2 } from "lucide-react"

export function ShippingManager({ methods }: { methods: any[] }) {
    const [loading, setLoading] = useState<string | null>(null)

    const handleUpdate = async (method: any, newPrice: string, newActive: boolean) => {
        setLoading(method.id)
        try {
            await updateShippingMethod(method.id, parseFloat(newPrice), newActive)
            toast.success("Shipping updated")
        } catch (e) {
            toast.error("Failed to update")
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="grid gap-4">
            {methods.map((method) => (
                <div key={method.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Info Section */}
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${method.active !== false ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">{method.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">{method.estimated_days}</p>
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Price Input */}
                        <div className="relative flex-1 md:w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                            <Input
                                defaultValue={method.price}
                                type="number"
                                step="0.01"
                                className="pl-6 h-10 font-mono font-bold bg-slate-50 border-transparent focus:bg-white transition-all"
                                onBlur={(e) => {
                                    if (parseFloat(e.target.value) !== method.price) {
                                        handleUpdate(method, e.target.value, method.active !== false)
                                    }
                                }}
                            />
                        </div>

                        {/* Toggle Switch (Active/Inactive) */}
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={method.active !== false}
                                onCheckedChange={(val) => handleUpdate(method, method.price.toString(), val)}
                            />
                        </div>

                        {/* Status Indicator (Mobile friendly feedback) */}
                        <div className="w-8 flex justify-center">
                            {loading === method.id ? (
                                <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5 text-slate-200" />
                            )}
                        </div>
                    </div>

                </div>
            ))}
        </div>
    )
}