import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { PieChartCard } from "@/components/admin/PieChartCard";
import { BarChartCard } from "@/components/admin/BarChartCard";
import { SummaryTableCard } from "@/components/admin/SummaryTableCard";
import { Users, Calendar, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";

type PieItem = { name: string; value: number };
type BarItem = { month: number; value: number };


const AdminDashboard = () => {
  const { api, safeRequest } = useApi();
  const [pieData, setPieData] = useState<PieItem[]>([]);
  const [barData, setBarData] = useState<BarItem[]>([]);
  const [stats, setStats] = useState({ ongoing: 0, organizers: 0, total_events: 0 });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const now = new Date()
  const [year, setYear] = useState<number>(now.getFullYear())
  const [month, setMonth] = useState<number>(now.getMonth() + 1)
  const [limit, setLimit] = useState<number>(3)
  const [timeWindow, setTimeWindow] = useState<'day' | 'month' | 'year'>('month')
  const todayStr = now.toISOString().slice(0, 10) // YYYY-MM-DD

  const load = async (params?: { year?: number; month?: number; limit?: number; day?: string }) => {
    safeRequest(async () => {
      const q: Record<string, string | number> = {}
      if (params?.year) q.year = params.year
      if (params?.month) q.month = params.month
      if (params?.limit) q.limit = params.limit
      if (params?.day) q.day = params.day
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
        const pieWithColors = (res.data.pie || []).map((p: any, idx: number) => ({ 
          ...p, 
          color: colors[idx % colors.length] 
        }))
        setPieData(pieWithColors)
        setBarData(res.data.bar || [])
        setStats(res.data.stats || { ongoing: 0, organizers: 0, total_events: 0 })
        setLeaderboard(res.data.leaderboard || [])
      }
    })
  }

  useEffect(() => {
    // determine params according to timeWindow
    const params: any = { limit }
    if (timeWindow === 'day') params.day = todayStr
    if (timeWindow === 'month') { params.year = year; params.month = month }
    if (timeWindow === 'year') { params.year = year }
    load(params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <AdminLayout>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        {/* <div className="flex items-center gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Window</label>
            <select value={timeWindow} onChange={(e) => setTimeWindow(e.target.value as any)} className="ml-2 p-2 rounded border">
              <option value="day">This day</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Năm</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="ml-2 p-2 rounded border">
              {Array.from({ length: 3 }).map((_, i) => {
                const y = now.getFullYear() - i
                return <option key={y} value={y}>{y}</option>
              })}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Tháng</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="ml-2 p-2 rounded border">
              {Array.from({ length: 12 }).map((_, i) => {
                const m = i + 1
                return <option key={m} value={m}>{m}</option>
              })}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Top</label>
            <input type="number" min={1} max={10} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="ml-2 w-20 p-2 rounded border" />
          </div>

          <button onClick={() => {
            const params: any = { limit }
            if (timeWindow === 'day') params.day = todayStr
            if (timeWindow === 'month') { params.year = year; params.month = month }
            if (timeWindow === 'year') { params.year = year }
            load(params)
          }} className="ml-3 px-3 py-2 bg-primary text-white rounded">Tải lại</button>
        </div> */}

        <div className="text-sm text-muted-foreground">Dữ liệu được cache 60s (có thể cấu hình)</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <PieChartCard 
            title="Số hội nghị theo chuyên mục" 
            data={pieData} 
            initialYear={year}
            initialMonth={month}
            initialLimit={limit}
          />
          <BarChartCard 
            title="Số hội nghị theo tháng" 
            data={barData.map(b => ({ name: String(b.month), value: b.value }))} 
            initialYear={year}
            initialWindow={timeWindow}
            initialDay={todayStr}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              title="Sự kiện đang mở" 
              value={String(stats.ongoing)} 
              icon={Calendar} 
            />
            <StatCard 
              title="Tổng số ban tổ chức" 
              value={String(stats.organizers)} 
              icon={Users} 
            />
          </div>
          
          <StatCard 
            title="Tổng số hội nghị" 
            value={String(stats.total_events)} 
            icon={UserCheck} 
          />

          <SummaryTableCard 
            title="Top hội nghị theo lượt đăng ký (tháng này)" 
            items={leaderboard.map((l, idx) => ({ id: idx + 1, title: l.name, count: `${l.registrations} lượt đăng ký`, subtitle: '' }))}
            linkText="Xem tất cả"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
