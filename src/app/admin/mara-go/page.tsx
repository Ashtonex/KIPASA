"use client"

import { useState, useEffect } from "react"
import { addMaraEntry, deleteMaraEntry } from "@/actions/mara-actions"
import { useMaraIntelligence } from "@/hooks/useMaraIntelligence"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Zap, Calculator, Trash2, Layers, Plus, TrendingUp, AlertTriangle, FileText, ArrowRight } from "lucide-react"
import { MaraAnalytics } from "@/components/admin/MaraAnalytics"
import { toast } from "sonner" // Import toast for notifications

export default function MaraPage() {
    const [valuations, setValuations] = useState<any[]>([])

    // --- FORM STATE ---
    const [inputs, setInputs] = useState({
        name: "",
        quantity: "100",
        unitBuy: "5",
        sellPrice: "0"
    })
    const [extraCosts, setExtraCosts] = useState<{ name: string, value: string }[]>([])

    // --- INTELLIGENCE ENGINE ---
    const intelligence = useMaraIntelligence(
        parseFloat(inputs.quantity) || 0,
        parseFloat(inputs.unitBuy) || 0,
        extraCosts,
        parseFloat(inputs.sellPrice) || 0
    )

    useEffect(() => {
        const fetch = async () => {
            const supabase = createClient()
            const { data } = await supabase.from("mara_valuations").select("*").order("created_at", { ascending: false })
            if (data) setValuations(data)
        }
        fetch()
    }, [])

    const handleInputChange = (e: any) => {
        const { name, value } = e.target
        setInputs(prev => ({ ...prev, [name]: value }))
    }

    const addCostRow = () => setExtraCosts([...extraCosts, { name: "", value: "" }])

    const updateCostRow = (index: number, field: 'name' | 'value', val: string) => {
        const newCosts = [...extraCosts]
        newCosts[index] = { ...newCosts[index], [field]: val }
        setExtraCosts(newCosts)
    }

    // --- FIX: Wrapper to handle Server Action return types ---
    const handleSubmit = async (formData: FormData) => {
        try {
            const result = await addMaraEntry(formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Valuation Logged Successfully")
                // Optional: Refresh local list or reset form here if desired
            }
        } catch (e) {
            toast.error("An unexpected error occurred")
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 print:bg-white print:p-0">

            {/* HEADER (Hidden when printing) */}
            <div className="flex items-center gap-3 print:hidden">
                <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Mara Intelligence</h1>
                    <p className="text-slate-500 font-medium text-xs">Financial Modeling & Valuation Engine</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* === LEFT COLUMN: INPUTS === */}
                <div className="lg:col-span-7 space-y-6 print:hidden">
                    <Card className="p-6 border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Calculator className="h-5 w-5 text-indigo-600" />
                            <h2 className="font-bold text-slate-900">Cost Injection (Absorption)</h2>
                        </div>

                        {/* FIX: Use handleSubmit instead of addMaraEntry directly */}
                        <form action={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Product Name</label>
                                    <Input name="name" onChange={handleInputChange} placeholder="Item Name..." className="font-bold" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400">Qty</label>
                                    <Input name="quantity" type="number" value={inputs.quantity} onChange={handleInputChange} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400">Unit Buy ($)</label>
                                    <Input name="unit_buy_price" type="number" step="0.01" value={inputs.unitBuy} onChange={handleInputChange} required />
                                </div>
                            </div>

                            {/* Dynamic Costs */}
                            <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                                        <Layers className="w-3 h-3" /> Cost Stacking
                                    </label>
                                    <button type="button" onClick={addCostRow} className="text-[10px] font-bold text-indigo-600 uppercase hover:underline">
                                        + Add Layer
                                    </button>
                                </div>
                                {extraCosts.map((cost, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input name={`cost_name_${i}`} placeholder="Name (e.g. Duty)" className="flex-1 h-9 text-xs"
                                            onChange={(e) => updateCostRow(i, 'name', e.target.value)} />
                                        <Input name={`cost_value_${i}`} type="number" placeholder="$" className="w-24 h-9 text-xs"
                                            onChange={(e) => updateCostRow(i, 'value', e.target.value)} />
                                    </div>
                                ))}
                            </div>

                            {/* PRICE ENGINE */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-black uppercase text-slate-400">Set Selling Price ($)</label>

                                {/* Suggestions Bar */}
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    <div
                                        onClick={() => setInputs(p => ({ ...p, sellPrice: intelligence.suggestions.breakEven.toFixed(2) }))}
                                        className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg border border-slate-200 min-w-[100px] transition-all"
                                    >
                                        <div className="text-[9px] font-black uppercase text-slate-400">Break Even</div>
                                        <div className="text-sm font-bold text-slate-700">${intelligence.suggestions.breakEven.toFixed(2)}</div>
                                    </div>
                                    <div
                                        onClick={() => setInputs(p => ({ ...p, sellPrice: intelligence.suggestions.conservative.toFixed(2) }))}
                                        className="cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-100 min-w-[100px] transition-all"
                                    >
                                        <div className="text-[9px] font-black uppercase text-blue-400">Standard (30%)</div>
                                        <div className="text-sm font-bold text-blue-700">${intelligence.suggestions.conservative.toFixed(2)}</div>
                                    </div>
                                    <div
                                        onClick={() => setInputs(p => ({ ...p, sellPrice: intelligence.suggestions.growth.toFixed(2) }))}
                                        className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg border border-indigo-100 min-w-[100px] transition-all"
                                    >
                                        <div className="text-[9px] font-black uppercase text-indigo-400">Growth (50%)</div>
                                        <div className="text-sm font-bold text-indigo-700">${intelligence.suggestions.growth.toFixed(2)}</div>
                                    </div>
                                </div>

                                <Input
                                    name="sellPrice"
                                    type="number"
                                    step="0.01"
                                    value={inputs.sellPrice}
                                    onChange={handleInputChange}
                                    className={`font-black text-lg h-12 ${intelligence.insight.status === 'critical' ? 'border-red-300 bg-red-50 text-red-600' :
                                        intelligence.insight.status === 'healthy' ? 'border-indigo-200 focus:border-indigo-500' : ''
                                        }`}
                                    required
                                />

                                {/* Hidden input for server action */}
                                <input type="hidden" name="target_sell_price" value={inputs.sellPrice} />

                                <div className={`text-xs font-bold flex items-center gap-2 ${intelligence.insight.status === 'critical' ? 'text-red-600' :
                                    intelligence.insight.status === 'warning' ? 'text-amber-600' :
                                        'text-green-600'
                                    }`}>
                                    {intelligence.insight.status === 'critical' && <AlertTriangle className="h-4 w-4" />}
                                    {intelligence.insight.message}
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 font-bold uppercase tracking-widest text-xs h-14 rounded-xl">
                                Commit to Ledger
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* === RIGHT COLUMN: ANALYTICS & STATEMENTS === */}
                <div className="lg:col-span-5 space-y-6">

                    {/* VISUAL ANALYTICS */}
                    <MaraAnalytics intelligence={intelligence} inputs={inputs} />

                    {/* Pro Forma Statement */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 print:shadow-none print:border-2">
                        <div className="bg-slate-900 p-4 flex items-center justify-between print:bg-white print:border-b">
                            <h3 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2 print:text-slate-900">
                                <FileText className="w-4 h-4" /> Pro-Forma Income Statement
                            </h3>
                            <span className="text-[9px] text-slate-400 bg-slate-800 px-2 py-1 rounded print:hidden">PROJECTED</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase">Revenue (Sales)</span>
                                <span className="text-sm font-mono font-bold text-slate-900">${intelligence.financials.projectedRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                <span className="text-xs font-bold text-red-400 uppercase">Cost of Goods Sold</span>
                                <span className="text-sm font-mono font-bold text-red-500">(${intelligence.financials.projectedCOGS.toLocaleString()})</span>
                            </div>
                            <div className="flex justify-between items-end pt-2">
                                <span className="text-sm font-black text-slate-900 uppercase">Gross Profit</span>
                                <span className={`text-xl font-mono font-black ${intelligence.financials.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {intelligence.financials.grossProfit >= 0 ? '+' : ''}${intelligence.financials.grossProfit.toLocaleString()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-4">
                                <div className="bg-slate-50 p-3 rounded-lg text-center print:border print:bg-white">
                                    <div className="text-[9px] font-black uppercase text-slate-400">Net Margin</div>
                                    <div className="text-lg font-black text-slate-700">{intelligence.financials.marginPercent.toFixed(1)}%</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg text-center print:border print:bg-white">
                                    <div className="text-[9px] font-black uppercase text-slate-400">Markup</div>
                                    <div className="text-lg font-black text-slate-700">{intelligence.financials.markupPercent.toFixed(1)}%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Balance Sheet Impact (Hidden on Print) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 print:hidden">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Balance Sheet Impact
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-600">Inventory Assets (Current)</span>
                                <span className="font-bold text-slate-900 flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3 text-green-500" />
                                    Increase by ${intelligence.totalBatchCost.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-600">Cash / Payable</span>
                                <span className="font-bold text-slate-900 flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3 text-red-500" />
                                    Decrease by ${intelligence.totalBatchCost.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- EXISTING ENTRIES LIST (Hidden on Print) --- */}
            <div className="pt-10 border-t border-slate-200 print:hidden">
                <h3 className="text-lg font-black uppercase text-slate-900 mb-6">Valuation Ledger</h3>
                <div className="space-y-4">
                    {valuations.map((item: any) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                            <div>
                                <div className="font-bold text-slate-900">{item.item_name}</div>
                                <div className="text-xs text-slate-500">Qty: {item.quantity} • Buy: ${item.unit_buy_price} • Target: ${item.target_sell_price}</div>
                            </div>
                            <form action={deleteMaraEntry.bind(null, item.id)}>
                                <Button variant="ghost" size="icon" className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                            </form>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}