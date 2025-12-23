import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Send,
  Edit,
  Trash2,
  Calendar,
  X,
  BarChart3,
  Pause,
  Play,
  Repeat,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useApi } from "@/hooks/use-api";
import { notificationApi } from "@/lib/notificationApi";
import type {
  Notification,
  NotificationStatus,
  NotificationScope,
} from "@/types/notifications";
import {
  getStatusBadge as getStatusBadgeComponent,
  getNotificationTypeBadge,
  getRecurringStatusBadge,
} from "@/components/common/NotificationBadges";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { safeRequest } = useApi();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | "ALL">(
    "ALL"
  );
  const [scopeFilter, setScopeFilter] = useState<NotificationScope | "ALL">(
    "ALL"
  );
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Dialogs
  const [deleteConfirm, setDeleteConfirm] = useState<Notification | null>(null);
  const [sendConfirm, setSendConfirm] = useState<Notification | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<Notification | null>(null);
  const [pauseConfirm, setPauseConfirm] = useState<Notification | null>(null);
  const [resumeConfirm, setResumeConfirm] = useState<Notification | null>(null);

  const loadNotifications = async () => {
    await safeRequest(async () => {
      const params: any = { page, limit };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (scopeFilter !== "ALL") params.scope = scopeFilter;

      const response = await notificationApi.list(params);
      setNotifications(response.items || []);
      setTotal(response.total || 0);
    });
  };

  useEffect(() => {
    void loadNotifications();
  }, [page, statusFilter, scopeFilter]);

  const filteredNotifications = useMemo(() => {
    if (!searchTerm) return notifications;
    const lower = searchTerm.toLowerCase();
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.body.toLowerCase().includes(lower)
    );
  }, [notifications, searchTerm]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await safeRequest(async () => {
      await notificationApi.delete(deleteConfirm.notification_id);
      toast.success("Xóa thông báo thành công");
      setDeleteConfirm(null);
      await loadNotifications();
    });
  };

  const handleSend = async () => {
    if (!sendConfirm) return;
    await safeRequest(async () => {
      const result = await notificationApi.send(sendConfirm.notification_id);
      toast.success(
        `Gửi thành công ${result.total_sent}/${result.total_recipients} thông báo`
      );
      setSendConfirm(null);
      await loadNotifications();
    });
  };

  const handleCancel = async () => {
    if (!cancelConfirm) return;
    await safeRequest(async () => {
      await notificationApi.cancel(cancelConfirm.notification_id);
      toast.success("Hủy lịch gửi thành công");
      setCancelConfirm(null);
      await loadNotifications();
    });
  };

  const handlePause = async () => {
    if (!pauseConfirm) return;
    await safeRequest(async () => {
      await notificationApi.pause(pauseConfirm.notification_id);
      toast.success("Tạm dừng thông báo lặp lại thành công");
      setPauseConfirm(null);
      await loadNotifications();
    });
  };

  const handleResume = async () => {
    if (!resumeConfirm) return;
    await safeRequest(async () => {
      const result = await notificationApi.resume(
        resumeConfirm.notification_id
      );
      const nextSend = result.next_send_at
        ? format(new Date(result.next_send_at), "dd/MM/yyyy HH:mm")
        : "";
      toast.success(
        `Tiếp tục thông báo thành công${
          nextSend ? `. Lần gửi tiếp theo: ${nextSend}` : ""
        }`
      );
      setResumeConfirm(null);
      await loadNotifications();
    });
  };

  const getStatusBadge = (status: NotificationStatus) => {
    return getStatusBadgeComponent(status);
  };

  const getScopeBadge = (scope: NotificationScope) => {
    const colors = {
      all: "bg-purple-100 text-purple-700",
      event: "bg-blue-100 text-blue-700",
      organizer: "bg-green-100 text-green-700",
    };
    const labels = {
      all: "Toàn bộ",
      event: "Sự kiện",
      organizer: "Ban tổ chức",
    };
    return <Badge className={colors[scope]}>{labels[scope]}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý thông báo</h1>
            <p className="text-muted-foreground mt-1">
              Tạo và gửi thông báo đẩy đến người dùng
            </p>
          </div>
          <Button onClick={() => navigate("/admin/notifications/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo thông báo
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm thông báo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as NotificationStatus | "ALL")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="scheduled">Đã lên lịch</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="sending">Đang gửi</SelectItem>
              <SelectItem value="sent">Đã gửi</SelectItem>
              <SelectItem value="failed">Thất bại</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={scopeFilter}
            onValueChange={(value) =>
              setScopeFilter(value as NotificationScope | "ALL")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả phạm vi</SelectItem>
              <SelectItem value="all">Toàn bộ</SelectItem>
              <SelectItem value="event">Sự kiện</SelectItem>
              <SelectItem value="organizer">Ban tổ chức</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications Table */}
        <div className="bg-card rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Tiêu đề</th>
                  <th className="text-left p-4 font-medium">Loại</th>
                  <th className="text-left p-4 font-medium">Trạng thái</th>
                  <th className="text-left p-4 font-medium">Phạm vi</th>
                  <th className="text-left p-4 font-medium">Thống kê</th>
                  <th className="text-left p-4 font-medium">Thời gian</th>
                  <th className="text-right p-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map((notification) => (
                  <tr
                    key={notification.notification_id}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {notification.body}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {getNotificationTypeBadge(notification)}
                        {getRecurringStatusBadge(notification)}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(notification.status)}
                    </td>
                    <td className="p-4">{getScopeBadge(notification.scope)}</td>
                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        {notification.total_recipients !== undefined && (
                          <>
                            <div>
                              Gửi: {notification.total_sent || 0}/
                              {notification.total_recipients}
                            </div>
                            <div className="text-muted-foreground">
                              Mở: {notification.total_opened || 0}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {notification.is_recurring &&
                          notification.next_send_at && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Repeat className="w-3 h-3" />
                              Tiếp theo:{" "}
                              {format(
                                new Date(notification.next_send_at),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </div>
                          )}
                        {notification.is_recurring &&
                          notification.last_sent_at && (
                            <div className="text-muted-foreground">
                              Gần nhất:{" "}
                              {format(
                                new Date(notification.last_sent_at),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </div>
                          )}
                        {notification.is_recurring &&
                          notification.total_executions !== undefined && (
                            <div className="text-muted-foreground">
                              Đã gửi: {notification.total_executions} lần
                            </div>
                          )}
                        {!notification.is_recurring &&
                          notification.scheduled_at && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Calendar className="w-3 h-3" />
                              {format(
                                new Date(notification.scheduled_at),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {/* Recurring: Active */}
                        {notification.is_recurring &&
                          notification.status === "active" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPauseConfirm(notification)}
                              >
                                <Pause className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteConfirm(notification)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        {/* Recurring: Paused (draft) */}
                        {notification.is_recurring &&
                          notification.status === "draft" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setResumeConfirm(notification)}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteConfirm(notification)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        {/* One-time: Draft */}
                        {!notification.is_recurring &&
                          notification.status === "draft" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  navigate(
                                    `/admin/notifications/${notification.notification_id}/edit`
                                  )
                                }
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setSendConfirm(notification)}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteConfirm(notification)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        {/* One-time: Scheduled */}
                        {!notification.is_recurring &&
                          notification.status === "scheduled" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  navigate(
                                    `/admin/notifications/${notification.notification_id}/edit`
                                  )
                                }
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setCancelConfirm(notification)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(page - 1) * limit + 1} -{" "}
                {Math.min(page * limit, total)} / {total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * limit >= total}
                  onClick={() => setPage(page + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa thông báo "{deleteConfirm?.title}"? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Confirmation */}
      <AlertDialog
        open={!!sendConfirm}
        onOpenChange={(open) => !open && setSendConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận gửi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn gửi thông báo "{sendConfirm?.title}"? Thông báo
              sẽ được gửi đến tất cả người dùng trong phạm vi đã chọn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend}>Gửi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Schedule Confirmation */}
      <AlertDialog
        open={!!cancelConfirm}
        onOpenChange={(open) => !open && setCancelConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy lịch gửi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn hủy lịch gửi thông báo "{cancelConfirm?.title}"?
              Thông báo sẽ chuyển về trạng thái bản nháp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>
              Hủy lịch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pause Recurring Confirmation */}
      <AlertDialog
        open={!!pauseConfirm}
        onOpenChange={(open) => !open && setPauseConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tạm dừng thông báo lặp lại</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn tạm dừng thông báo "{pauseConfirm?.title}"? Thông
              báo sẽ ngừng gửi cho đến khi bạn tiếp tục lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handlePause}>
              Tạm dừng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resume Recurring Confirmation */}
      <AlertDialog
        open={!!resumeConfirm}
        onOpenChange={(open) => !open && setResumeConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tiếp tục thông báo lặp lại</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn tiếp tục thông báo "{resumeConfirm?.title}"?
              Thông báo sẽ được gửi theo lịch đã thiết lập.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleResume}>
              Tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminNotifications;
