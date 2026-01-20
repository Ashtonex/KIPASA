"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define the shape of the data strictly
interface ChartProps {
  data: {
    name: string;
    total: number;
    monthIndex?: number; // Optional fields from the parent logic
    year?: number;
  }[]
}

// Helper to format currency nicely (e.g. $1,250)
const currencyFormatter = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0, // No cents on the axis to save space
  }).format(value);

const tooltipFormatter = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

export function OverviewCharts({ data }: ChartProps) {
  // Guard clause: If no data exists, show a polite message
  if (!data || data.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7 p-10 text-center text-muted-foreground bg-slate-50 border-dashed">
          No telemetry data available for the selected period.
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

      {/* 1. LINE CHART: Trends over time */}
      <Card className="col-span-4 rounded-[2rem] border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={currencyFormatter}
                width={60}
              />
              <Tooltip
                formatter={(value: number) => [tooltipFormatter(value), "Revenue"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                }}
                labelStyle={{ fontWeight: "bold", color: "#1e293b", marginBottom: "0.25rem" }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2. BAR CHART: Magnitude per month */}
      <Card className="col-span-3 rounded-[2rem] border-none shadow-sm bg-white">
        <CardHeader>
          {/* RENAMED to reflect actual data (Time) instead of "Category" */}
          <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Monthly Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                formatter={(value: number) => [tooltipFormatter(value), "Volume"]}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
              />
              <Bar
                dataKey="total"
                fill="#3b82f6"
                radius={[6, 6, 6, 6]}
                barSize={40}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}