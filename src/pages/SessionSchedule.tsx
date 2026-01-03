import { useMemo, useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ConferenceLayout } from "@/components/layout/ConferenceLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { RoomSelector } from "@/components/conference/RoomSelector";

type CalendarItem = {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO date string
  end: string; // ISO date string
  speakers?: { id?: number; name: string; avatarUrl?: string }[];
  room: string;
  files?: { name: string; url?: string }[];
}; 
  
const HOUR_HEIGHT = 64; // px per hour

const DRAG_STEP_MINUTES = 15;
const MIN_SESSION_MINUTES = 15;

const COLORS = ["#60a5fa", "#22d3ee", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#38bdf8", "#f97316", "#ef4444", "#0ea5e9"];

const getColorForKey = (key: string) => {
  const hash = Array.from(key).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
};

const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday=0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (d: Date, days: number) => {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
};

const formatDateLabel = (d: Date) => {
  const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dayOfWeek = weekdays[d.getDay()];
  const dateStr = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "2-digit" });
  return { dayOfWeek, dateStr };
};

const minutesSinceMidnight = (d: Date) => d.getHours() * 60 + d.getMinutes();

const getInitials = (name?: string) => {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || "") + (p[p.length - 1]?.[0] || "")).toUpperCase();
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const clampInt = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.trunc(n)));

const formatHHMMFromMinutes = (mins: number) => {
  const m = clampInt(mins, 0, 24 * 60 - 1);
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const SessionSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const today = new Date();
    // weekStart is stateful so we can navigate between weeks
    const [weekStart, setWeekStart] = useState<Date>(startOfWeek(today));

  // rooms / places loaded from API
  const { api, safeRequest } = useApi();
  const [places, setPlaces] = useState<{ id: string; name: string }[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | undefined>(undefined);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    speakerIds: [] as string[],
    files: [] as { name: string; url?: string }[],
  });
  // Edit state
  const [editSessionId, setEditSessionId] = useState<string | null>(null);

  const [speakers, setSpeakers] = useState<{ id: number; full_name: string; photo_url?: string }[]>([])

  const [event, setEvent] = useState<any | null>(null);
  const [isEditable, setIsEditable] = useState(true);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; sessionId: string | null }>({
    isOpen: false,
    sessionId: null,
  });

  // Scroll sync refs
  const timeScrollRef = useRef<HTMLDivElement>(null);
  const daysScrollRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<CalendarItem[]>([]);

  const [dragCreate, setDragCreate] = useState<{
    active: boolean;
    dayIdx: number;
    startMin: number;
    endMin: number;
  } | null>(null);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const itemsByDay = useMemo(() => {
    const filtered = items.filter((it) => it.room === (selectedRoom ?? ''));
    return weekDays.map((day) => {
      const dayItems = filtered.filter((it) => {
        const d = new Date(it.start);
        return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate();
      });
      return dayItems;
    });
  }, [items, selectedRoom, weekDays]);

  // Sync scroll between time column and days grid
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    // Use setTimeout to ensure DOM elements are rendered
    const timer = setTimeout(() => {
      const timeScroll = timeScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      const daysScroll = daysScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      
      if (!timeScroll || !daysScroll) return;

      let isSyncing = false;

      const handleTimeScroll = () => {
        if (isSyncing) return;
        isSyncing = true;
        if (daysScroll.scrollTop !== timeScroll.scrollTop) {
          daysScroll.scrollTop = timeScroll.scrollTop;
        }
        requestAnimationFrame(() => {
          isSyncing = false;
        });
      };

      const handleDaysScroll = () => {
        if (isSyncing) return;
        isSyncing = true;
        if (timeScroll.scrollTop !== daysScroll.scrollTop) {
          timeScroll.scrollTop = daysScroll.scrollTop;
        }
        requestAnimationFrame(() => {
          isSyncing = false;
        });
      };

      timeScroll.addEventListener('scroll', handleTimeScroll);
      daysScroll.addEventListener('scroll', handleDaysScroll);

      // Store cleanup function
      cleanup = () => {
        timeScroll.removeEventListener('scroll', handleTimeScroll);
        daysScroll.removeEventListener('scroll', handleDaysScroll);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanup?.();
    };
  }, []);

  // Load event, sessions and places
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      // event
      const ev = await safeRequest(() => api.get(`/organizer/events/${id}`));
      const evData = (ev as any)?.data ?? ev ?? null;
      if (evData) {
        setEvent(evData);
        const ended = evData.end_time ? new Date(evData.end_time) < new Date() : false;
        setIsEditable(!ended);
        // Set default weekStart based on event timeframe
        try {
          const now = new Date();
          const evStart = evData.start_time ? new Date(evData.start_time) : null;
          if (evStart && now < evStart) {
            setWeekStart(startOfWeek(evStart));
          } else {
            setWeekStart(startOfWeek(now));
          }
        } catch (err) {
          // ignore
        }
      }

      // sessions for event
      const s = await safeRequest(() => api.get(`/organizer/sessions/event/${id}`));
      const sData = (s as any)?.data ?? s ?? null;
      if (sData && Array.isArray(sData.data)) {
        setItems(
          sData.data.map((it: any) => ({
            id: String(it.id),
            title: it.title,
            description: it.description,
            start: it.start_time,
            end: it.end_time,
            speakers: Array.isArray(it.speakers)
              ? it.speakers.map((sp: any) => ({
                  id: sp.id,
                  name: sp.full_name,
                  avatarUrl: sp.photo_url,
                }))
              : [],
            room: it.place,
            files: [],
          }))
        )
      }

      // places for event
      const p = await safeRequest(() => api.get(`/organizer/places/event/${id}`));
      const pData = (p as any)?.data ?? p ?? [];
      if (Array.isArray(pData)) {
        setPlaces(pData.map((pl: any) => ({ id: pl.id || pl._id || pl.id, name: pl.name })));
        if (pData.length > 0) setSelectedRoom(pData[0].name)
      }
      // speakers for event
      const sp = await safeRequest(() => api.get(`/organizer/speakers/event/${id}`))
      const spData = (sp as any)?.data ?? sp ?? null
      if (spData && Array.isArray(spData.data)) {
        setSpeakers(spData.data.map((s: any) => ({ id: s.id, full_name: s.full_name, photo_url: s.photo_url })))
      }
    }

    load()
  }, [id, api, safeRequest])

  const goPrevWeek = () => setWeekStart((ws) => addDays(ws, -7));
  const goNextWeek = () => setWeekStart((ws) => addDays(ws, 7));

  const handleAddRoom = async (roomName: string) => {
    if (!id) return;
    const res = await safeRequest(() => api.post('/organizer/places', { event_id: id, name: roomName }))
    const data = (res as any)?.data ?? res ?? null
    if (data) {
      setPlaces((ps) => [...ps, { id: data.id || data._id, name: data.name }])
      setSelectedRoom(roomName)
    }
  };

  const handleEditRoom = async (roomId: string, newName: string) => {
    const res = await safeRequest(() => api.patch(`/organizer/places/${roomId}`, { name: newName }))
    if (res !== undefined) {
      setPlaces((ps) => ps.map((p) => p.id === roomId ? { ...p, name: newName } : p))
      if (selectedRoom === places.find(p => p.id === roomId)?.name) {
        setSelectedRoom(newName)
      }
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    const roomToDelete = places.find((p) => p.id === roomId);
    if (!roomToDelete) return;
    
    // Delete all sessions in this room first
    const sessionsToDelete = items.filter((item) => item.room === roomToDelete.name);
    for (const session of sessionsToDelete) {
      await safeRequest(() => api.delete(`/organizer/sessions/${session.id}`));
    }
    
    // Delete the room
    const res = await safeRequest(() => api.delete(`/organizer/places/${roomId}`))
    if (res !== undefined) {
      setPlaces((ps) => ps.filter((p) => p.id !== roomId))
      setItems((items) => items.filter((item) => item.room !== roomToDelete.name))
      // Select first available room or undefined
      const remainingRooms = places.filter((p) => p.id !== roomId)
      setSelectedRoom(remainingRooms.length > 0 ? remainingRooms[0]?.name : undefined)
    }
  }

  // Open dialog for new or edit
  const handleOpenDialog = (session?: CalendarItem) => {
    if (!selectedRoom && !session) {
      alert('Vui lòng thêm phòng trước khi tạo phiên hội nghị.');
      return;
    }
    if (session) {
      // Edit mode
      const start = new Date(session.start);
      const end = new Date(session.end);

      const sessionSpeakerIds = (session.speakers || [])
        .map((sp) => {
          if (typeof sp.id === 'number') return String(sp.id);
          // Fallback: match by name against loaded speakers list
          const match = speakers.find((s) => s.full_name === sp.name);
          return match ? String(match.id) : null;
        })
        .filter(Boolean) as string[];

      setFormData({
        title: session.title,
        description: session.description || "",
        startDate: start.toISOString().split('T')[0],
        startTime: start.toTimeString().slice(0,5),
        endDate: end.toISOString().split('T')[0],
        endTime: end.toTimeString().slice(0,5),
        speakerIds: sessionSpeakerIds,
        files: session.files || [],
      });
      setEditSessionId(session.id);
      setIsDialogOpen(true);
    } else {
      // New mode
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        title: "",
        description: "",
        startDate: now.toISOString().split('T')[0],
        startTime: "09:00",
        endDate: tomorrow.toISOString().split('T')[0],
        endTime: "17:00",
        speakerIds: [],
        files: [],
      });
      setEditSessionId(null);
      setIsDialogOpen(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files).map(file => ({
      name: file.name,
      url: undefined, // In real app, upload and get URL
    }));
    
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }));
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleSaveSchedule = () => {
    if (!formData.title || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      alert('Vui lòng điền đầy đủ tiêu đề và thời gian.')
      return;
    }
    if (!isEditable) return;

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    const payload: any = {
      event_id: id,
      title: formData.title,
      description: formData.description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      place: selectedRoom,
      capacity: 50,
      speakers: (formData.speakerIds || []).map((sid) => Number(sid)).filter((n) => Number.isFinite(n)),
    };

    (async () => {
      if (editSessionId) {
        // Edit mode
        const res = await safeRequest(() => api.patch(`/organizer/sessions/${editSessionId}/properties`, payload));
        const data = (res as any)?.data ?? res ?? null;
        if (data) {
          setItems(prev => prev.map(item => item.id === editSessionId ? {
            ...item,
            title: data.title,
            description: data.description,
            start: data.start_time,
            end: data.end_time,
            speakers: Array.isArray(data.speakers)
              ? data.speakers.map((sp: any) => ({ id: sp.id, name: sp.full_name, avatarUrl: sp.photo_url }))
              : [],
            room: data.place,
            files: [],
          } : item));
          setIsDialogOpen(false);
          setEditSessionId(null);
        }
      } else {
        // New mode
        const res = await safeRequest(() => api.post('/organizer/sessions', payload));
        const data = (res as any)?.data ?? res ?? null;
        if (data) {
          const newItem: CalendarItem = {
            id: String(data.id || data._id || Date.now()),
            title: data.title,
            description: data.description,
            start: data.start_time,
            end: data.end_time,
            speakers: Array.isArray(data.speakers)
              ? data.speakers.map((sp: any) => ({ id: sp.id, name: sp.full_name, avatarUrl: sp.photo_url }))
              : [],
            room: data.place,
            files: [],
          };
          setItems(prev => [...prev, newItem]);
          setIsDialogOpen(false);
        }
      }
    })();
  };

  const handleDeleteSession = async () => {
    if (!deleteConfirm.sessionId) return;
    
    const ok = await safeRequest(() => api.delete(`/organizer/sessions/${deleteConfirm.sessionId}`));
    if (ok !== undefined) {
      setItems(prev => prev.filter(i => i.id !== deleteConfirm.sessionId));
    }
    setDeleteConfirm({ isOpen: false, sessionId: null });
  };

  const canAddItem = !!selectedRoom && isEditable;

  const getMinutesFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const rawMinutes = (y / HOUR_HEIGHT) * 60;
    const stepped = Math.round(rawMinutes / DRAG_STEP_MINUTES) * DRAG_STEP_MINUTES;
    return clampInt(stepped, 0, 24 * 60 - 1);
  };

  const getDayIdxFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const colW = rect.width / 7;
    return clampInt(Math.floor(x / colW), 0, 6);
  };

  const handleGridPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canAddItem || isDialogOpen) return;
    // Only start drag on primary button (mouse) or touch/pen.
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const target = e.target as Element | null;
    // Don't start a drag if the user is interacting with an existing session card.
    if (target?.closest('[data-session-card="true"]')) return;

    const dayIdx = getDayIdxFromPointer(e);
    const startMin = getMinutesFromPointer(e);
    const endMin = clampInt(startMin + DRAG_STEP_MINUTES, 0, 24 * 60 - 1);

    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
    setDragCreate({ active: true, dayIdx, startMin, endMin });
  };

  const handleGridPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragCreate?.active) return;
    const endMin = getMinutesFromPointer(e);
    setDragCreate((prev) => (prev ? { ...prev, endMin } : prev));
  };

  const cancelDragCreate = () => setDragCreate(null);

  const finalizeDragCreate = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragCreate?.active) return;
    const { dayIdx, startMin, endMin } = dragCreate;

    const a = Math.min(startMin, endMin);
    let b = Math.max(startMin, endMin);
    if (b - a < MIN_SESSION_MINUTES) b = a + MIN_SESSION_MINUTES;
    b = clampInt(b, 0, 24 * 60 - 1);

    const day = weekDays[dayIdx];
    if (!day) {
      setDragCreate(null);
      return;
    }

    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    start.setMinutes(a);
    const end = new Date(day);
    end.setHours(0, 0, 0, 0);
    end.setMinutes(b);

    setEditSessionId(null);
    setFormData({
      title: "",
      description: "",
      startDate: start.toISOString().split("T")[0],
      startTime: start.toTimeString().slice(0, 5),
      endDate: end.toISOString().split("T")[0],
      endTime: end.toTimeString().slice(0, 5),
      speakerIds: [],
      files: [],
    });
    setIsDialogOpen(true);
    setDragCreate(null);
  };

  const headerDateStr = today.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
  const weekRangeStr = `${weekDays[0].toLocaleDateString('vi-VN',{day: '2-digit', month: 'short'})} - ${weekDays[6].toLocaleDateString('vi-VN',{day: '2-digit', month: 'short'})}`;

  const toggleSpeakerId = (speakerId: string) => {
    setFormData((prev) => {
      const current = prev.speakerIds || [];
      const exists = current.includes(speakerId);
      return {
        ...prev,
        speakerIds: exists ? current.filter((id) => id !== speakerId) : [...current, speakerId],
      };
    });
  };

  const selectedSpeakers = useMemo(() => {
    const set = new Set(formData.speakerIds || []);
    return speakers.filter((s) => set.has(String(s.id)));
  }, [formData.speakerIds, speakers]);

  const renderSpeakerBubbles = (sessionSpeakers?: { name: string; avatarUrl?: string }[]) => {
    const list = Array.isArray(sessionSpeakers) ? sessionSpeakers : [];
    if (list.length === 0) return null;
    const shown = list.slice(0, 3);
    const remaining = list.length - shown.length;

    return (
      <div className="flex items-center -space-x-2">
        {shown.map((sp, idx) => (
          <Avatar key={`${sp.name}-${idx}`} className="h-6 w-6 ring-2 ring-white/50">
            {sp.avatarUrl ? (
              <AvatarImage src={sp.avatarUrl} alt={sp.name} />
            ) : (
              <AvatarFallback className="bg-black/20 text-white">{getInitials(sp.name)}</AvatarFallback>
            )}
          </Avatar>
        ))}
        {remaining > 0 && (
          <div className="h-6 w-6 rounded-full bg-black/20 text-white text-[10px] flex items-center justify-center ring-2 ring-white/50">
            +{remaining}
          </div>
        )}
      </div>
    );
  };

  return (
    <ConferenceLayout sidebarTitle="Hội nghị Công nghệ Số Việt Nam 2025">
      <div className="px-6 py-6">
        <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goPrevWeek} className="p-2 rounded hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-lg font-medium">{weekRangeStr}</div>
            <button onClick={goNextWeek} className="p-2 rounded hover:bg-gray-100">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="ml-3 text-sm text-muted-foreground">Hôm nay | {headerDateStr}</div>
          </div>
          <div className="flex items-center gap-2">
            <RoomSelector
              rooms={places}
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
              onAddRoom={handleAddRoom}
              onEditRoom={handleEditRoom}
              onDeleteRoom={handleDeleteRoom}
              disabled={!isEditable}
            />
            <Button onClick={() => handleOpenDialog()}>
              Thêm lịch
            </Button>
          </div>
        </div>

        {/* Calendar area - fits screen height with internal scroll for hours */}
        <div className="rounded-2xl border bg-white">
          <div className="grid grid-cols-[64px,1fr]">
            {/* Time column header spacer + days header */}
            <div />
            <div className="grid grid-cols-7 border-b">
              {weekDays.map((d, i) => {
                const { dayOfWeek, dateStr } = formatDateLabel(d);
                const isTodayCol = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
                return (
                  <div key={i} className={`px-4 py-3 items-center flex-col ${isTodayCol ? 'bg-gray-50' : ''}`}>
                    <div className="text-l font-medium align-center font-heading self-center">{dayOfWeek}</div>
                    <div className="text-xs text-muted-foreground align-center self-center">{dateStr}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-[64px,1fr]" style={{ height: "calc(100vh - 240px)" }}>
            {/* Time column */}
            <ScrollArea ref={timeScrollRef} className="h-full border-r">
              <div style={{ height: HOUR_HEIGHT * 24 }} className="relative">
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="absolute left-0 right-0" style={{ top: h * HOUR_HEIGHT }}>
                    <div className="h-px bg-border" />
                    <div className="text-xs text-black mt-[-10px] pl-2 bg-white font-heading text-bold">{`${String(h).padStart(2, "0")}:00`}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Days grid */}
            <ScrollArea ref={daysScrollRef} className="h-full">
              <div
                className={`grid grid-cols-7 relative ${canAddItem ? "cursor-crosshair" : ""}`}
                style={{ height: HOUR_HEIGHT * 24 }}
                onPointerDown={handleGridPointerDown}
                onPointerMove={handleGridPointerMove}
                onPointerUp={finalizeDragCreate}
                onPointerCancel={cancelDragCreate}
                onPointerLeave={cancelDragCreate}
              >
                {weekDays.map((day, dayIdx) => (
                  <div key={dayIdx} className={`relative border-l ${day.getFullYear() === today.getFullYear() && day.getMonth() === today.getMonth() && day.getDate() === today.getDate() ? 'bg-gray-50' : ''}`}>
                    {/* hour lines */}
                    {Array.from({ length: 24 }, (_, h) => (
                      <div key={h} className="absolute left-0 right-0 h-px bg-border/50" style={{ top: h * HOUR_HEIGHT }} />
                    ))}

                    {/* event time-frame overlay (green, low opacity) */}
                    {event && event.start_time && event.end_time && (() => {
                      try {
                        const evStart = new Date(event.start_time);
                        const evEnd = new Date(event.end_time);
                        const dayStart = new Date(day);
                        dayStart.setHours(0,0,0,0);
                        const dayEnd = new Date(day);
                        dayEnd.setHours(23,59,59,999);
                        const frameStart = evStart > dayStart ? evStart : dayStart;
                        const frameEnd = evEnd < dayEnd ? evEnd : dayEnd;
                        if (frameStart < frameEnd) {
                          const top = (minutesSinceMidnight(frameStart) / 60) * HOUR_HEIGHT;
                          const height = ((frameEnd.getTime() - frameStart.getTime()) / (1000 * 60 * 60)) * HOUR_HEIGHT;
                          return (
                            <div className="absolute left-0 right-0 rounded" style={{ top, height, backgroundColor: 'rgba(16,185,129,0.1)', pointerEvents: 'none' }} />
                          )
                        }
                      } catch (err) {
                        return null;
                      }
                      return null;
                    })()}

                    {/* drag-to-create preview */}
                    {canAddItem && dragCreate?.active && dragCreate.dayIdx === dayIdx && (() => {
                      const a = Math.min(dragCreate.startMin, dragCreate.endMin);
                      let b = Math.max(dragCreate.startMin, dragCreate.endMin);
                      if (b - a < MIN_SESSION_MINUTES) b = a + MIN_SESSION_MINUTES;
                      b = clampInt(b, 0, 24 * 60 - 1);
                      const top = (a / 60) * HOUR_HEIGHT;
                      const height = ((b - a) / 60) * HOUR_HEIGHT;
                      return (
                        <div
                          className="absolute left-2 right-2 rounded-xl border border-dashed bg-muted/60 text-foreground shadow-sm pointer-events-none"
                          style={{ top, height }}
                        >
                          <div className="p-3 space-y-1 text-xs">
                            <div className="font-medium">Tạo phiên hội nghị</div>
                            <div className="text-muted-foreground">
                              {formatHHMMFromMinutes(a)} - {formatHHMMFromMinutes(b)}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* events */}
                    <div className="relative h-full px-2">
                      {itemsByDay[dayIdx].map((it) => {
                        const s = new Date(it.start);
                        const e = new Date(it.end);
                        const top = (minutesSinceMidnight(s) / 60) * HOUR_HEIGHT;
                        const height = ((e.getTime() - s.getTime()) / (1000 * 60 * 60)) * HOUR_HEIGHT;
                        const color = getColorForKey(it.id + it.title + it.room);
                        return (
                          <div
                            key={it.id}
                            className="absolute left-2 right-2 rounded-xl shadow-sm text-white overflow-clip cursor-pointer"
                            style={{ top, height, backgroundColor: color }}
                            onClick={() => isEditable && handleOpenDialog(it)}
                            data-session-card="true"
                          >
                            <div className="p-3 space-y-2 text-sm">
                              <div className="flex justify-between items-start">
                                <div className="font-medium leading-tight line-clamp-2">{it.title}</div>
                                {isEditable && (
                                  <button
                                    className="ml-2 text-xs bg-black/20 rounded px-2 py-1"
                                    onClick={e => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, sessionId: it.id }); }}
                                  >Xóa</button>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs opacity-90">
                                <span>
                                  {s.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} -
                                  {" "}
                                  {e.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>

                              <div className='justify-items-start items-end pt-3'>
                                {renderSpeakerBubbles(it.speakers)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Add Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editSessionId ? "Chỉnh sửa phiên hội nghị" : "Thêm phiên hội nghị"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Tiêu đề phiên hội nghị <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tiêu đề phiên hội nghị"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả phiên hội nghị</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Nhập mô tả phiên hội nghị"
                rows={4}
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label>
                Thời gian <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-xs text-muted-foreground">Từ</Label>
                  <div className="flex gap-2">
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="flex-1"
                    />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-xs text-muted-foreground">Đến</Label>
                  <div className="flex gap-2">
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="flex-1"
                    />
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Speaker */}
            <div className="space-y-2">
              <Label htmlFor="speaker">Diễn giả trong phiên hội nghị</Label>

              {selectedSpeakers.length > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    {selectedSpeakers.slice(0, 3).map((sp) => (
                      <Avatar key={sp.id} className="h-7 w-7 ring-2 ring-background">
                        {sp.photo_url ? (
                          <AvatarImage src={sp.photo_url} alt={sp.full_name} />
                        ) : (
                          <AvatarFallback className="bg-black/20 text-white">{getInitials(sp.full_name)}</AvatarFallback>
                        )}
                      </Avatar>
                    ))}
                    {selectedSpeakers.length > 3 && (
                      <div className="h-7 w-7 rounded-full bg-muted text-foreground text-xs flex items-center justify-center ring-2 ring-background">
                        +{selectedSpeakers.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Đã chọn {selectedSpeakers.length} diễn giả</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Chưa chọn diễn giả</div>
              )}

              <div className="rounded-md border">
                <ScrollArea className="h-48">
                  <div className="p-2 space-y-1">
                    {speakers.map((sp) => {
                      const sid = String(sp.id);
                      const selected = (formData.speakerIds || []).includes(sid);
                      return (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => toggleSpeakerId(sid)}
                          className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left hover:bg-muted ${selected ? 'bg-muted' : ''}`}
                        >
                          <Avatar className="h-7 w-7">
                            {sp.photo_url ? (
                              <AvatarImage src={sp.photo_url} alt={sp.full_name} />
                            ) : (
                              <AvatarFallback className="bg-black/20 text-white">{getInitials(sp.full_name)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-sm">{sp.full_name}</div>
                          </div>
                          {selected && (
                            <div className="text-xs text-muted-foreground">Đã chọn</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Files */}
            <div className="space-y-2">
              <Label>Tài liệu cho phiên hội nghị</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm"
                  >
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="fileUpload"
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('fileUpload')?.click()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm tài liệu
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="destructive" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveSchedule}>
              Lưu thông tin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Session Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(isOpen) => setDeleteConfirm({ isOpen, sessionId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phiên hội nghị</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phiên hội nghị này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </ConferenceLayout>
  );
};

export default SessionSchedule;


