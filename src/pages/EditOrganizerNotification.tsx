import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Save, Send } from "lucide-react";
import { organizerNotificationApi } from "@/lib/organizerNotificationApi";
import { useToast } from "@/hooks/use-toast";
import { Notification } from "@/types/notifications";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConferenceLayout } from "@/components/layout/ConferenceLayout";

export default function EditOrganizerNotification() {
  const { id: eventId, notificationId } = useParams<{
    id?: string;
    notificationId?: string;
  }>();
  const notifId = notificationId || eventId; // Support both routes
  const navigate = useNavigate();
  const { toast } = useToast();
  const { api, safeRequest } = useApi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("");
  const [events, setEvents] = useState<Array<{ _id: string; name: string }>>(
    []
  );
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    image_url: "",
    scope: "event" as "event" | "organizer",
    target_id: "",
    action_type: "none",
    action_value: "",
  });

  useEffect(() => {
    if (notifId) {
      loadNotification();
    }
  }, [notifId]);

  // Auto-fill event ID if in event context
  useEffect(() => {
    if (eventId && notificationId) {
      setFormData((prev) => ({ ...prev, target_id: eventId }));
    }
  }, [eventId, notificationId]);

  useEffect(() => {
    if (formData.scope === "event") {
      loadEvents();
    }
  }, [formData.scope]);

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await safeRequest(() =>
        api.get("/organizer/events/my-events")
      );
      if (response) {
        const data = (response as any)?.data || response;
        const eventsData = Array.isArray(data) ? data : [];
        setEvents(eventsData);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadNotification = async () => {
    try {
      const data = await organizerNotificationApi.getById(notifId!);
      setNotification(data);

      setFormData({
        title: data.title,
        body: data.body,
        image_url: data.image_url || "",
        scope: (data.scope === "all" ? "event" : data.scope) as
          | "event"
          | "organizer",
        target_id: (data as any).target_id || "",
        action_type: (data as any).action_type || "none",
        action_value: (data as any).action_value || "",
      });

      if (data.scheduled_at) {
        const date = new Date(data.scheduled_at);
        setScheduledDate(date);
        setScheduledTime(format(date, "HH:mm"));
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể tải thông báo",
      });
      const backUrl = eventId
        ? `/conference/${eventId}/notifications`
        : "/notifications";
      navigate(backUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let scheduled_at = null;
      if (scheduledDate && scheduledTime) {
        const [hours, minutes] = scheduledTime.split(":");
        const combinedDate = new Date(scheduledDate);
        combinedDate.setHours(parseInt(hours, 10));
        combinedDate.setMinutes(parseInt(minutes, 10));
        scheduled_at = combinedDate.toISOString();
      }

      const payload: any = {
        title: formData.title,
        body: formData.body,
        image_url: formData.image_url || undefined,
        scope: formData.scope,
        target_id:
          formData.target_id && formData.target_id !== "none"
            ? formData.target_id
            : undefined,
      };

      // Only add action fields if action_type is not 'none'
      if (formData.action_type !== "none") {
        payload.action_type = formData.action_type;
        payload.action_value = formData.action_value;
      }

      await organizerNotificationApi.update(notifId!, payload);

      // If scheduled time changed, reschedule
      if (
        notification?.scheduled_at !== scheduled_at &&
        scheduled_at &&
        notification?.status === "scheduled"
      ) {
        await organizerNotificationApi.reschedule(notifId!, scheduled_at);
      }

      toast({
        title: "Thành công",
        description: "Thông báo đã được cập nhật",
      });
      const backUrl = eventId
        ? `/conference/${eventId}/notifications`
        : "/notifications";
      navigate(backUrl);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông báo",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendNow = async () => {
    if (!notifId) return;
    setSaving(true);
    try {
      await organizerNotificationApi.send(notifId);
      toast({
        title: "Thành công",
        description: "Thông báo đã được gửi",
      });
      const backUrl = eventId
        ? `/conference/${eventId}/notifications`
        : "/notifications";
      navigate(backUrl);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể gửi thông báo",
      });
    } finally {
      setSaving(false);
    }
  };

  const Layout = eventId ? ConferenceLayout : DashboardLayout;
  const backUrl = eventId
    ? `/conference/${eventId}/notifications`
    : "/notifications";

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">Đang tải...</div>
        </div>
      </Layout>
    );
  }

  if (!notification) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(backUrl)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Chỉnh sửa thông báo</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin thông báo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="Nhập tiêu đề thông báo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Nội dung *</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  required
                  placeholder="Nhập nội dung thông báo"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL hình ảnh</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Only show scope/event selector if not in event context */}
              {!eventId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scope">Phạm vi *</Label>
                    <Select
                      value={formData.scope}
                      onValueChange={(value: "event" | "organizer") => {
                        setFormData({
                          ...formData,
                          scope: value,
                          target_id: "",
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="event">Sự kiện</SelectItem>
                        <SelectItem value="organizer">Người tổ chức</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.scope === "event" && (
                    <div className="space-y-2">
                      <Label htmlFor="target_id">Chọn sự kiện</Label>
                      <Select
                        value={formData.target_id || "none"}
                        onValueChange={(value) =>
                          setFormData({ ...formData, target_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn sự kiện..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Tất cả sự kiện</SelectItem>
                          {loadingEvents ? (
                            <SelectItem value="loading" disabled>
                              Đang tải...
                            </SelectItem>
                          ) : (
                            events.map((event) => (
                              <SelectItem key={event._id} value={event._id}>
                                {event.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.scope === "organizer" && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">
                        Gửi đến tất cả người tổ chức
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Thông báo sẽ được gửi đến tất cả người tổ chức trong hệ
                        thống
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(notification.status === "scheduled" ||
                notification.status === "draft") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Thời gian gửi
                    </Label>
                    {notification.status === "scheduled" && (
                      <Badge className="bg-blue-100 text-blue-700">
                        Lịch hiện tại
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !scheduledDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDate ? (
                            format(scheduledDate, "dd/MM/yyyy")
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={setScheduledDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      disabled={!scheduledDate}
                      placeholder="Chọn giờ"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Label>Hành động (tùy chọn)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="action_type">Loại hành động</Label>
                    <Select
                      value={formData.action_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, action_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không có</SelectItem>
                        <SelectItem value="url">Mở URL</SelectItem>
                        <SelectItem value="screen">Mở màn hình</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="action_value">Giá trị hành động</Label>
                    <Input
                      id="action_value"
                      value={formData.action_value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          action_value: e.target.value,
                        })
                      }
                      disabled={formData.action_type === "none"}
                      placeholder="URL hoặc tên màn hình"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/notifications")}
                  disabled={saving}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                {(notification.status === "draft" ||
                  notification.status === "scheduled") && (
                  <Button
                    type="button"
                    onClick={handleSendNow}
                    disabled={saving}
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {saving ? "Đang gửi..." : "Gửi ngay"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
}
