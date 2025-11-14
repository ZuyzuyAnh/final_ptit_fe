import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { MoreHorizontal, Clock } from "lucide-react";

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartCardProps {
  title: string;
  data?: PieChartData[]; // optional: card can fetch its own data
  initialYear?: number;
  initialMonth?: number;
  initialLimit?: number;
}

export const PieChartCard = ({ title, data: initialData, initialYear, initialMonth, initialLimit = 3 }: PieChartCardProps) => {
  const { api, safeRequest } = useApi()
  const now = new Date()
  const [year, setYear] = useState<number>(initialYear ?? now.getFullYear())
  const [month, setMonth] = useState<number>(initialMonth ?? (now.getMonth() + 1))
  const [limit, setLimit] = useState<number>(initialLimit)
  const [data, setData] = useState<PieChartData[]>(initialData ?? [])
  const [loading, setLoading] = useState(false)

  // Sync with parent-provided data updates (so dashboard-level fetch populates card)
  useEffect(() => {
    if (initialData) setData(initialData)
  }, [initialData])

  const load = async (opts?: { year?: number; month?: number; limit?: number }) => {
    setLoading(true)
    await safeRequest(async () => {
      const q: Record<string, string | number> = {}
      if (opts?.year) q.year = opts.year
      if (opts?.month) q.month = opts.month
      if (opts?.limit) q.limit = opts.limit
      const qs = new URLSearchParams(q as Record<string, string>).toString()
      const path = `/admin/stats${qs ? `?${qs}` : ''}`
      const res = await api.get(path) as any
      if (res?.success && res.data) {
        const colors = [
          '#FF6B6B', // coral red
          '#4ECDC4', // turquoise
          '#FFE66D', // sunny yellow
          '#95E1D3', // mint green
          '#A8E6CF', // light green
          '#FFD93D', // golden yellow
          '#6BCF7F', // fresh green
          '#F38181', // soft pink
          '#AA96DA', // lavender
          '#FCBAD3', // light rose
          '#A8D8EA', // sky blue
          '#FFAAA5', // peach
        ]
        const pie = (res.data.pie || []).map((p: any, idx: number) => ({ 
          ...p, 
          color: colors[idx % colors.length] 
        }))
        setData(pie)
      }
    })
    setLoading(false)
  }

  useEffect(() => {
    // if no initialData provided, fetch defaults
    if (!initialData) load({ year, month, limit })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const currentValue = payload[0].value;
      // Calculate total from all data items
      const total = data.reduce((sum, item) => sum + item.value, 0);
      const percentage = total > 0 ? ((currentValue / total) * 100).toFixed(1) : '0.0';
      
      return (
        <div className="bg-card border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1" style={{ color: payload[0].payload.color }}>
            {payload[0].name}
          </p>
          <p className="text-sm text-muted-foreground">
            Số lượng: <span className="font-medium text-foreground">{currentValue}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Tỷ lệ: <span className="font-medium text-foreground">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card h-fit rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4" />
          {title}
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))} 
            className="text-xs px-2 py-1 rounded border border-gray-200 bg-background"
          >
            {Array.from({ length: 3 }).map((_, i) => {
              const y = now.getFullYear() - i
              return <option key={y} value={y}>{y}</option>
            })}
          </select>
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))} 
            className="text-xs px-2 py-1 rounded border border-gray-200 bg-background"
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const m = i + 1
              return <option key={m} value={m}>Tháng {m}</option>
            })}
          </select>
          {/* <input 
            type="number" 
            min={1} 
            max={20} 
            value={limit} 
            onChange={(e) => setLimit(Number(e.target.value))} 
            className="text-xs w-16 px-2 py-1 rounded border border-gray-200 bg-background" 
            placeholder="Top"
          /> */}
          <button 
            disabled={loading} 
            onClick={() => {
              load({ year, month, limit })
            }} 
            className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
          >
            Áp dụng
          </button>
        </div>
      </div>

      <div className="p-4 h-64 flex items-center justify-center">
        {loading ? (
          <div className="text-sm text-muted-foreground">Đang tải...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="middle" 
                align="right"
                layout="vertical"
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
