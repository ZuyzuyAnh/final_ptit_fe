// Notification API Service Layer
import { api } from "./apiClient";
import type { ApiResponse, PaginatedResponse } from "@/types/rbac";
import type {
  Notification,
  NotificationStats,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationQueryParams,
  RescheduleRequest,
  SendResponse,
  CronValidationRequest,
  CronValidationResponse,
  CommonCronPattern,
} from "@/types/notifications";

// Helper to unwrap API responses (reuse from rbacApi)
function unwrap<T>(response: any): T {
  // Transform _id to notification_id for single notification objects
  const transformNotification = (item: any) => {
    if (item && item._id && !item.notification_id) {
      return { ...item, notification_id: item._id };
    }
    return item;
  };

  // Handle new response structure: { success, data: [], pagination: {} }
  if (response?.pagination) {
    const itemsArray = response.data || [];

    if (itemsArray && Array.isArray(itemsArray)) {
      return {
        items: itemsArray.map(transformNotification),
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        total_pages:
          response.pagination.totalPages || response.pagination.total_pages,
      } as T;
    }
  }

  // Handle nested data response: { data: { data: [], pagination: {} } }
  const data = response?.data ?? response;
  if (data?.pagination) {
    const itemsArray = data.data || data.notifications || [];

    if (itemsArray && Array.isArray(itemsArray)) {
      return {
        items: itemsArray.map(transformNotification),
        total: data.pagination.total,
        page: data.pagination.page,
        limit: data.pagination.limit,
        total_pages: data.pagination.totalPages || data.pagination.total_pages,
      } as T;
    }
  }

  // Transform single notification object
  return transformNotification(data);
}

export const notificationApi = {
  // List notifications
  async list(
    params?: NotificationQueryParams
  ): Promise<PaginatedResponse<Notification>> {
    const response = await api.get<
      ApiResponse<PaginatedResponse<Notification>>
    >("/admin/notifications", {
      query: params as any,
    });
    return unwrap(response);
  },

  // Get notification by ID
  async getById(id: string): Promise<Notification> {
    const response = await api.get<ApiResponse<Notification>>(
      `/admin/notifications/${id}`
    );
    return unwrap(response);
  },

  // Create notification
  async create(data: CreateNotificationRequest): Promise<Notification> {
    const response = await api.post<ApiResponse<Notification>>(
      "/admin/notifications",
      data
    );
    return unwrap(response);
  },

  // Update notification
  async update(
    id: string,
    data: UpdateNotificationRequest
  ): Promise<Notification> {
    const response = await api.put<ApiResponse<Notification>>(
      `/admin/notifications/${id}`,
      data
    );
    return unwrap(response);
  },

  // Delete notification
  async delete(id: string): Promise<void> {
    await api.delete(`/admin/notifications/${id}`);
  },

  // Send notification
  async send(id: string): Promise<SendResponse> {
    const response = await api.post<ApiResponse<SendResponse>>(
      `/admin/notifications/${id}/send`
    );
    return unwrap(response);
  },

  // Get notification statistics
  async getStats(id: string): Promise<NotificationStats> {
    const response = await api.get<ApiResponse<NotificationStats>>(
      `/admin/notifications/${id}/stats`
    );
    return unwrap(response);
  },

  // Cancel scheduled notification
  async cancel(id: string): Promise<Notification> {
    const response = await api.post<ApiResponse<Notification>>(
      `/admin/notifications/${id}/cancel`
    );
    return unwrap(response);
  },

  // Reschedule notification
  async reschedule(id: string, data: RescheduleRequest): Promise<Notification> {
    const response = await api.post<ApiResponse<Notification>>(
      `/admin/notifications/${id}/reschedule`,
      data
    );
    return unwrap(response);
  },

  // Validate cron pattern
  async validateCron(
    data: CronValidationRequest
  ): Promise<CronValidationResponse> {
    const response = await api.post<ApiResponse<CronValidationResponse>>(
      "/admin/notifications/cron/validate",
      data
    );
    return unwrap(response);
  },

  // Get common cron patterns
  async getCommonPatterns(): Promise<CommonCronPattern[]> {
    const response = await api.get<ApiResponse<CommonCronPattern[]>>(
      "/admin/notifications/cron/patterns"
    );
    return unwrap(response);
  },

  // Pause recurring notification
  async pause(id: string): Promise<Notification> {
    const response = await api.post<ApiResponse<Notification>>(
      `/admin/notifications/${id}/pause`
    );
    return unwrap(response);
  },

  // Resume recurring notification
  async resume(id: string): Promise<Notification> {
    const response = await api.post<ApiResponse<Notification>>(
      `/admin/notifications/${id}/resume`
    );
    return unwrap(response);
  },
};
