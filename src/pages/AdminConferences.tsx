import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Input as CustomInput } from "@/components/common/Input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Trash2, Filter, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";

interface Conference {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  organizer: string;
  contact: string;
  status: "ongoing" | "upcoming" | "ended";
  isVisible: boolean;
  startTime?: string;
  endTime?: string;
}

const AdminConferences = () => {
  const { api, safeRequest } = useApi()
  const [conferences, setConferences] = useState<Conference[]>([])
  const [rawMapped, setRawMapped] = useState<Conference[]>([])
  const [organizers, setOrganizers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStart, setFilterStart] = useState<string>('') // yyyy-mm-dd
  const [filterEnd, setFilterEnd] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<'all' | Conference['status']>('all')

  const load = async () => {
    setLoading(true)
    await safeRequest(async () => {
      const res = (await api.get('/admin/events')) as any
      const payload = res?.data ?? res
      const items = payload?.items || []
      const nowDt = new Date()
      const mapped = items.map((e: any) => {
        const start = e.start_time ? new Date(e.start_time) : null
        const end = e.end_time ? new Date(e.end_time) : null
        let status: Conference['status'] = 'upcoming'

        if (start && end) {
          if (nowDt >= start && nowDt <= end) status = 'ongoing'
          else if (nowDt > end) status = 'ended'
          else status = 'upcoming'
        } else if (end) {
          status = nowDt > end ? 'ended' : 'upcoming'
        } else if (start) {
          status = nowDt >= start ? 'ongoing' : 'upcoming'
        }

        return {
          id: e._id,
          name: e.name,
          startDate: start ? start.toLocaleString() : '',
          endDate: end ? end.toLocaleString() : '',
          venue: e.location,
          organizer: e.organizer?.name ?? e.organizer_id ?? '',
          contact: e.organizer?.phone ?? e.organizer?.email ?? '',
          status,
          isVisible: e.status === 'approved',
          startTime: e.start_time,
          endTime: e.end_time,
        }
      })
      setRawMapped(mapped)
      setConferences(mapped)

      // If backend returned only organizer IDs (organizer_id) without populated organizer.name,
      // fetch those organizer names and replace the ids in the UI.
      const missingIds = Array.from(new Set(items
        .filter((e: any) => !e.organizer?.name && e.organizer_id)
        .map((e: any) => e.organizer_id)
      ));

      if (missingIds.length > 0) {
        await safeRequest(async () => {
          const results = await Promise.all(missingIds.map((id) => api.get(`/admin/organizers/${id}`).catch(() => null)))
          const map = { ...organizers }
          results.forEach((r: any, idx: number) => {
            const id = missingIds[idx]
            if (!r) return
            const payload = r?.data ?? r
            const org = payload?.data ?? payload
            const name = org?.name ?? org?.full_name ?? org?.display_name ?? org?.username ?? id
            map[id] = name
          })
          setOrganizers(map)
          setRawMapped((prev) => prev.map((c) => ({ ...c, organizer: map[c.organizer] ?? c.organizer })))
          setConferences((prev) => prev.map((c) => ({ ...c, organizer: map[c.organizer] ?? c.organizer })))
        })
      }
    })
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const applyFilters = () => {
    const startBoundary = filterStart ? new Date(filterStart + 'T00:00:00') : null
    const endBoundary = filterEnd ? new Date(filterEnd + 'T23:59:59') : null

    const filtered = rawMapped.filter((ev) => {
      // search
      const q = searchQuery.trim().toLowerCase()
      if (q) {
        const hay = `${ev.name} ${ev.venue} ${ev.organizer} ${ev.contact}`.toLowerCase()
        if (!hay.includes(q)) return false
      }

      // status
      if (filterStatus !== 'all' && ev.status !== filterStatus) return false

      // date range: keep events that intersect the range
      const evStart = ev.startTime ? new Date(ev.startTime) : null
      const evEnd = ev.endTime ? new Date(ev.endTime) : null
      if (startBoundary) {
        // event must end after or on startBoundary
        if (evEnd && evEnd < startBoundary) return false
        if (!evEnd && evStart && evStart < startBoundary) return false
      }
      if (endBoundary) {
        // event must start before or on endBoundary
        if (evStart && evStart > endBoundary) return false
        if (!evStart && evEnd && evEnd > endBoundary) return false
      }

      return true
    })

    setConferences(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const resetFilters = () => {
    setSearchQuery('')
    setFilterStart('')
    setFilterEnd('')
    setFilterStatus('all')
    setConferences(rawMapped)
    setShowFilters(false)
    setCurrentPage(1) // Reset to first page
  }

  // Calculate pagination
  const totalPages = Math.ceil(conferences.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedConferences = conferences.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getStatusBadge = (status: Conference["status"]) => {
    switch (status) {
      case "ongoing":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Đang diễn ra
          </Badge>
        );
      case "ended":
        return (
          <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100">
            Đã kết thúc
          </Badge>
        );
      case "upcoming":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Sắp diễn ra
          </Badge>
        );
    }
  };

  const toggleVisibility = async (id: string) => {
    const conf = conferences.find((c) => c.id === id)
    if (!conf) return
    const newVisible = !conf.isVisible
    await safeRequest(async () => {
      await api.patch(`/admin/events/${id}/visibility`, { visible: newVisible })
      setConferences((prev) => prev.map((c) => (c.id === id ? { ...c, isVisible: newVisible } : c)))
    })
  }

  const deleteConference = async (id: string) => {
    await safeRequest(async () => {
      await api.delete(`/admin/events/${id}`)
      setConferences((prev) => prev.filter((conf) => conf.id !== id))
    })
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Search Bar with Filter Toggle */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') applyFilters() }}
              placeholder="Nhập tên sự kiện, đối tác hoặc địa điểm để tìm kiếm"
              className="pl-10 h-11"
            />
          </div>
          
          <Button
            variant={showFilters ? "default" : "outline"}
            size="default"
            onClick={() => setShowFilters(!showFilters)}
            className="h-11 px-4"
          >
            <Filter className="w-4 h-4 mr-2" />
            Bộ lọc
          </Button>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="bg-card rounded-xl p-6 shadow-sm border space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-semibold text-lg">Lọc hội nghị</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="font-heading text-foreground text-sm font-medium">
                  Từ ngày
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filterStart}
                    onChange={(e) => setFilterStart(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-heading text-foreground text-sm font-medium">
                  Đến ngày
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filterEnd}
                    onChange={(e) => setFilterEnd(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2 md:col-span-2">
                <label className="font-heading text-foreground text-sm font-medium">
                  Trạng thái
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="ongoing">Đang diễn ra</option>
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="ended">Đã kết thúc</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={applyFilters}
                className="flex-1 h-11 font-heading"
              >
                Áp dụng bộ lọc
              </Button>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="h-11 px-6 font-heading"
              >
                Đặt lại
              </Button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-end">
          {/* <p className="text-sm text-muted-foreground">
            Hiển thị <span className="font-semibold text-foreground">{conferences.length}</span> hội nghị
          </p> */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { void load() }}
            className="h-9"
          >
            Làm mới
          </Button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[20%]" /> {/* Tên sự kiện */}
                <col className="w-[14%]" /> {/* Thời gian bắt đầu */}
                <col className="w-[14%]" /> {/* Thời gian kết thúc */}
                <col className="w-[12%]" /> {/* Địa điểm */}
                <col className="w-[15%]" /> {/* Đối tác */}
                <col className="w-[12%]" /> {/* Trạng thái */}
                <col className="w-[6%]" />  {/* Khoá/Mở khoá */}
                <col className="w-[6%]" />  {/* Hành động */}
              </colgroup>
              <thead>
                <tr className="bg-foreground text-background">
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    TÊN SỰ KIỆN
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    THỜI GIAN BẮT ĐẦU
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    THỜI GIAN KẾT THÚC
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    ĐỊA ĐIỂM
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    ĐỐI TÁC
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    TRẠNG THÁI
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold">
                    HIỂN THỊ
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold">
                    XOÁ
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedConferences.map((conference, index) => (
                  <tr
                    key={conference.id}
                    className={`border-b hover:bg-muted/50 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="truncate" title={conference.name}>
                        {conference.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="truncate">
                        {conference.startDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="truncate">
                        {conference.endDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="truncate" title={conference.venue}>
                        {conference.venue}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-muted-foreground truncate" title={conference.organizer}>
                        {conference.organizer}
                      </div>
                      <div className="text-xs text-muted-foreground truncate" title={conference.contact}>
                        {conference.contact}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(conference.status)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={conference.isVisible}
                          onCheckedChange={() => toggleVisibility(conference.id)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteConference(conference.id)}
                          className="text-muted-foreground hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Hiển thị {startIndex + 1} - {Math.min(endIndex, conferences.length)} trên tổng {conferences.length} bản ghi
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  {/* Previous button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 px-3"
                  >
                    Trước
                  </Button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    
                    // Show ellipsis
                    const showEllipsisBefore = page === currentPage - 2 && currentPage > 3
                    const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return <span key={page} className="text-muted-foreground px-1">...</span>
                    }

                    if (!showPage) return null

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="w-8 h-8 p-0 rounded-full"
                      >
                        {page}
                      </Button>
                    )
                  })}

                  {/* Next button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3"
                  >
                    Sau
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminConferences;
