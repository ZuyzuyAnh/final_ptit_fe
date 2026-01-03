import { Badge } from "@/components/ui/badge";
import type { Notification, NotificationStatus } from "@/types/notifications";
import { Repeat, Calendar, Zap, Pause } from "lucide-react";

export const getStatusBadge = (status: NotificationStatus) => {
  const config = {
    draft: { label: "Bản nháp", variant: "secondary" as const },
    scheduled: { label: "Đã lên lịch", variant: "default" as const },
    sending: { label: "Đang gửi", variant: "default" as const },
    sent: { label: "Đã gửi", variant: "default" as const },
    failed: { label: "Thất bại", variant: "destructive" as const },
    active: { label: "Đang hoạt động", variant: "default" as const },
  };

  const item = config[status] || config.draft;
  return <Badge variant={item.variant}>{item.label}</Badge>;
};

export const getNotificationTypeBadge = (notification: Notification) => {
  if (notification.is_recurring) {
    const pattern = notification.cron_pattern || "";

    // Determine frequency from cron pattern
    if (pattern.includes("* * *")) {
      if (pattern.startsWith("0 ")) {
        return (
          <Badge variant="outline" className="gap-1">
            <Repeat className="w-3 h-3" />
            Hàng ngày
          </Badge>
        );
      }
      if (pattern.includes("*/")) {
        return (
          <Badge variant="outline" className="gap-1">
            <Zap className="w-3 h-3" />
            Thường xuyên
          </Badge>
        );
      }
    }
    if (pattern.includes("* *") && !pattern.endsWith("*")) {
      return (
        <Badge variant="outline" className="gap-1">
          <Calendar className="w-3 h-3" />
          Hàng tuần
        </Badge>
      );
    }
    if (pattern.match(/\d+ \* \*/)) {
      return (
        <Badge variant="outline" className="gap-1">
          <Calendar className="w-3 h-3" />
          Hàng tháng
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <Repeat className="w-3 h-3" />
        Lặp lại
      </Badge>
    );
  } else if (notification.scheduled_at) {
    return (
      <Badge variant="outline" className="gap-1">
        <Calendar className="w-3 h-3" />
        Một lần
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="gap-1">
        <Zap className="w-3 h-3" />
        Ngay lập tức
      </Badge>
    );
  }
};

export const getRecurringStatusBadge = (notification: Notification) => {
  if (!notification.is_recurring) return null;

  if (notification.status === "active") {
    return (
      <Badge variant="default" className="gap-1">
        <Repeat className="w-3 h-3" />
        Đang chạy
      </Badge>
    );
  } else if (notification.status === "draft") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Pause className="w-3 h-3" />
        Đã tạm dừng
      </Badge>
    );
  }

  return null;
};
