"use client"

import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, ReferenceLine
} from "recharts"
import { Card } from "@/components/ui/card"
import { Download } from "lucide-react"

// Brand Colors
const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444'];

export function MaraAnalytics({ intelligence, inputs }: { intelligence: any, inputs: any }) {

    // 1. Data for "Where is the money going?" (Donut Chart)
    const costBreakdown = [
        { name: 'Base Cost', value: parseFloat(inputs.unitBuy) },
        { name: 'Extras (Duty/Ship)', value: intelligence.trueUnitCost - parseFloat(inputs.unitBuy) },
        { name: 'Net Profit', value: intelligence.financials.grossProfit / parseFloat(inputs.quantity) },
    ].filter(i => i.value > 0);

    // 2. Data for "Scenario Analysis" (Bar Chart)
    // We compare current setting vs Conservative vs Premium
    const scenarios = [
        {
            name: 'Break Even',
            profit: 0,
            revenue: intelligence.totalBatchCost
        },
        {
            name: 'Current',
            profit: intelligence.financials.grossProfit,
            revenue: intelligence.financials.projectedRevenue
        },
        {
            name: 'Premium (70%)',
            profit: (intelligence.suggestions.premium * inputs.quantity) - intelligence.totalBatchCost,
            revenue: intelligence.suggestions.premium * inputs.quantity
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-black uppercase text-slate-900 flex items-center gap-2">
                    Real-Time Visuals
                </h3>
                <button
                    onClick={() => window.print()}
                    className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 text-slate-400 hover:text-indigo-600"
                >
                    <Download className="w-3 h-3" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* CHART 1: UNIT ECONOMICS */}
                <Card className="p-4 border-slate-100 shadow-sm flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Unit Economics Breakdown</span>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={costBreakdown}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {costBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    // FIXED: Use 'any' type to satisfy Recharts strict typing
                                    formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* CHART 2: PROFIT SCENARIOS */}
                <Card className="p-4 border-slate-100 shadow-sm flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Profit Scenarios (Batch)</span>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scenarios}>
                                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis fontSize={10} tickFormatter={(val) => `$${val}`} tickLine={false} axisLine={false} />
                                <Tooltip
                                    // FIXED: Use 'any' type here as well
                                    formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                                />
                                <ReferenceLine y={0} stroke="#cbd5e1" />
                                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

            </div>
        </div>
    )
}