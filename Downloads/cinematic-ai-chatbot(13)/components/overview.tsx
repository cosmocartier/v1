"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
  { name: "Jun 03", value: 2400 },
  { name: "Jun 04", value: 1398 },
  { name: "Jun 05", value: 9800 },
  { name: "Jun 06", value: 3908 },
  { name: "Jun 07", value: 4800 },
  { name: "Jun 08", value: 15420 },
  { name: "Jun 09", value: 3490 },
  { name: "Jun 10", value: 4300 },
  { name: "Jun 11", value: 8200 },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="none"
          stroke="hsl(var(--border))"
          strokeWidth={1}
          horizontal={true}
          vertical={false}
        />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          fontWeight={500}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          fontWeight={500}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          dx={-10}
        />
        <Line
          type="linear"
          dataKey="value"
          stroke="hsl(var(--neo-accent))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--neo-accent))", strokeWidth: 0, r: 3 }}
          activeDot={{ r: 4, stroke: "hsl(var(--neo-accent))", strokeWidth: 2, fill: "hsl(var(--background))" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
