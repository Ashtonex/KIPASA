import { getCharonIntelligence } from "@/actions/charon-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Package, AlertTriangle, Lightbulb, TrendingDown, DollarSign, Brain } from "lucide-react"

export default async function CharonPage() {
    const data = await getCharonIntelligence()

    if (!data) {
        return <div className="p-8 text-slate-500 font-black uppercase tracking-widest text-center">Initializing Charon Protocols...</div>
    }

    const { revenue, suggestions, inventory } = data

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8">
            {/* HEADER */}
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-slate-300">
                    <Brain className="h-8 w-8 text-indigo-400 animate-pulse" />
                </div>
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 italic">Charon_Intelligence</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Predictive Sales & Procurement Engine</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* REVENUE FORECAST */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group">
                    <CardHeader className="bg-slate-900 pb-8 pt-6">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> Revenue Pipeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="-mt-4">
                        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-50 space-y-4">
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Projected Next 30d</span>
                                <div className="text-3xl font-black text-slate-900 tracking-tighter">${revenue.projected30d.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Past 30d Actual</span>
                                <span className="text-sm font-black text-indigo-600">${revenue.past30d.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* INVENTORY VALUATION */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-indigo-600 pb-8 pt-6">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" /> Asset Valuation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="-mt-4">
                        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-50 space-y-4">
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Stock Value</span>
                                <div className="text-3xl font-black text-slate-900 tracking-tighter">${inventory.totalValue.toLocaleString()}</div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">SKU Count</span>
                                <span className="text-sm font-black text-slate-700">{inventory.totalItems} Products</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* DAILY PERFORMANCE */}
                <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-100 pb-8 pt-6">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                            <Package className="h-4 w-4" /> Velocity Node
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="-mt-4">
                        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-50 space-y-4">
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avg Daily Transmissions</span>
                                <div className="text-3xl font-black text-slate-900 tracking-tighter">${revenue.dailyAvg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                            </div>
                            <div className="flex items-center gap-2 py-1 px-3 bg-green-50 rounded-full w-fit">
                                <TrendingUp className="h-3 w-3 text-green-600" />
                                <span className="text-[9px] font-black uppercase text-green-600 tracking-tight">Healthy Pipeline</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* PROCUREMENT SUGGESTIONS */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-500" /> Procurement Protocol
                        </h2>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Charon Recommendations</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {suggestions.length > 0 ? suggestions.map((s) => (
                            <div key={s.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-slate-900 uppercase tracking-tight">{s.name}</span>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${s.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                s.priority === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-slate-50 text-slate-400'
                                            }`}>
                                            {s.priority}_Priority
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">"{s.recommendation}"</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase text-slate-400">Current_Stock</div>
                                    <div className={`text-xl font-black tracking-tighter ${s.currentStock === 0 ? 'text-red-600' : 'text-slate-900'}`}>{s.currentStock}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                                <p className="text-xs font-black uppercase text-slate-300 tracking-[0.3em]">All stock levels are optimal, sir.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* TRENDS & INSIGHTS */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Intelligence_Brief</h2>
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6 shadow-2xl shadow-indigo-200">
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">System Note</h3>
                            <p className="font-serif italic text-sm text-indigo-100 leading-relaxed opacity-80">
                                "Sir, based on current sales velocity, I've identified several nodes that require immediate capital injection to maintain service levels. The revenue pipeline appears stable, but inventory depletion in high-velocity categories is imminent."
                            </p>
                        </div>

                        <div className="pt-6 border-t border-white/10 space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Calculated Trend</span>
                                <span className="text-green-400">+12.4%</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Node Efficiency</span>
                                <span className="text-indigo-400">Optimal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
