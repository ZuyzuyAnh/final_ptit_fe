import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "@/hooks/use-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Send } from "lucide-react";
import { organizerNotificationApi } from "@/lib/organizerNotificationApi";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConferenceLayout } from "@/components/layout/ConferenceLayout";
import { RecurringScheduleForm } from "@/components/common/RecurringScheduleForm";
import type {
  CommonCronPattern,
  CronValidationResponse,
} from "@/types/notifications";

export default function CreateOrganizerNotification() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { api, safeRequest } = useApi();
  const { id: eventId } = useParams<{ id?: string }>();
  const [loading, setLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("");
  const [events, setEvents] = useState<Array<{ _id: string; name: string }>>(
    []
  );
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Recurring schedule state
  const [commonPatterns, setCommonPatterns] = useState<CommonCronPattern[]>([]);
  const [cronValidation, setCronValidation] =
    useState<CronValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    image_url: "",
    target_event_id: eventId || "", // Auto-fill with current event if present
    // Schedule type
    schedule_type: "immediate" as "immediate" | "one-time" | "recurring",
    // Recurring fields
    cron_pattern: "",
    timezone: "Asia/Ho_Chi_Minh",
    recurrence_end_date: "",
  });

  // Update target_event_id when eventId changes
  useEffect(() => {
    if (eventId) {
      setFormData((prev) => ({ ...prev, target_event_id: eventId }));
    }
  }, [eventId]);

  // Fetch organizer's events
  useEffect(() => {
    loadEvents();
  }, []);

  // Load common cron patterns
  useEffect(() => {
    const loadPatterns = async () => {
      try {
        const patterns = await organizerNotificationApi.getCommonPatterns();
        setCommonPatterns(patterns);
      } catch (error) {
        console.error("Failed to load cron patterns:", error);
      }
    };
    void loadPatterns();
  }, []);

  // Validate cron pattern with debounce
  useEffect(() => {
    if (
      formData.schedule_type === "recurring" &&
      formData.cron_pattern &&
      formData.timezone
    ) {
      const timer = setTimeout(async () => {
        setIsValidating(true);
        try {
          const validation = await organizerNotificationApi.validateCron({
            cron_pattern: formData.cron_pattern,
            timezone: formData.timezone,
          });
          setCronValidation(validation);
        } catch (error) {
          console.error("Cron validation error:", error);
          setCronValidation({
            isValid: false,
            error: "Không thể kiểm tra cron pattern",
            description: null,
            nextExecutions: [],
          });
        } finally {
          setIsValidating(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setCronValidation(null);
    }
  }, [formData.cron_pattern, formData.timezone, formData.schedule_type]);

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

  const handleSubmit = async (e: React.FormEvent, sendNow: boolean = false) => {
    e.preventDefault();

    // Validate scheduling if not sending now
    if (formData.schedule_type === "one-time" && !sendNow) {
      if (!scheduledDate || !scheduledTime) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Vui lòng chọn ngày và giờ để lên lịch gửi thông báo",
        });
        return;
      }
    }

    // Validate recurring
    if (formData.schedule_type === "recurring" && !cronValidation?.isValid) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn lịch lặp lại hợp lệ",
      });
      return;
    }

    setLoading(true);

    try {
      let scheduled_at = null;
      if (
        formData.schedule_type === "one-time" &&
        !sendNow &&
        scheduledDate &&
        scheduledTime
      ) {
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
        scope: "event",
        scheduled_at,
      };

      // Add target_event_id if selected
      if (formData.target_event_id && formData.target_event_id !== "none") {
        payload.target_event_id = formData.target_event_id;
      }

      // Add recurring fields
      if (formData.schedule_type === "recurring") {
        payload.is_recurring = true;
        payload.cron_pattern = formData.cron_pattern;
        payload.timezone = formData.timezone;
        if (formData.recurrence_end_date) {
          payload.recurrence_end_date = new Date(
            formData.recurrence_end_date
          ).toISOString();
        }
      }

      const notification = await organizerNotificationApi.create(payload);

      if (sendNow && formData.schedule_type !== "recurring") {
        await organizerNotificationApi.send(notification.notification_id);
        toast({
          title: "Thành công",
          description: "Thông báo đã được gửi",
        });
      } else if (formData.schedule_type === "recurring") {
        toast({
          title: "Thành công",
          description: "Thông báo lặp lại đã được kích hoạt",
        });
      } else {
        toast({
          title: "Thành công",
          description: scheduled_at
            ? "Thông báo đã được lên lịch"
            : "Thông báo đã được tạo",
        });
      }

      navigate(backUrl);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể tạo thông báo",
      });
    } finally {
      setLoading(false);
    }
  };

  const Layout = eventId ? ConferenceLayout : DashboardLayout;
  const backUrl = eventId
    ? `/conference/${eventId}/notifications`
    : "/notifications";

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(backUrl)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Tạo thông báo mới</h1>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)}>
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

              {/* Only show event selector if not in event context */}
              {!eventId && (
                <div className="space-y-2">
                  <Label htmlFor="target_event_id">Chọn sự kiện *</Label>
                  <Select
                    value={formData.target_event_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, target_event_id: value })
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

              {/* Schedule Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Loại lịch gửi *
                </Label>
                <Select
                  value={formData.schedule_type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, schedule_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Gửi ngay</SelectItem>
                    <SelectItem value="one-time">Lên lịch một lần</SelectItem>
                    <SelectItem value="recurring">Lặp lại định kỳ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* One-time scheduling */}
              {formData.schedule_type === "one-time" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Thời gian gửi *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Chọn ngày và giờ để lên lịch gửi
                    </p>
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

              {/* Recurring scheduling */}
              {formData.schedule_type === "recurring" && (
                <RecurringScheduleForm
                  cronPattern={formData.cron_pattern}
                  timezone={formData.timezone}
                  recurrenceEndDate={formData.recurrence_end_date}
                  onCronPatternChange={(pattern) =>
                    setFormData({ ...formData, cron_pattern: pattern })
                  }
                  onTimezoneChange={(tz) =>
                    setFormData({ ...formData, timezone: tz })
                  }
                  onRecurrenceEndDateChange={(date) =>
                    setFormData({ ...formData, recurrence_end_date: date })
                  }
                  commonPatterns={commonPatterns}
                  validation={cronValidation}
                  isValidating={isValidating}
                />
              )}

              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/notifications")}
                  disabled={loading}
                >
                  Hủy
                </Button>
                {formData.schedule_type === "one-time" && (
                  <Button type="submit" disabled={loading}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {loading ? "Đang lên lịch..." : "Lên lịch gửi"}
                  </Button>
                )}
                {formData.schedule_type === "recurring" && (
                  <Button type="submit" disabled={loading}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {loading ? "Đang kích hoạt..." : "Kích hoạt lặp lại"}
                  </Button>
                )}
                {formData.schedule_type === "immediate" && (
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={loading}
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {loading ? "Đang gửi..." : "Gửi ngay"}
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
