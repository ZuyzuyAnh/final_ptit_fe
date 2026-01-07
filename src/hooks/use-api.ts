import { useCallback } from "react";
import { api, ApiError } from "@/lib/apiClient";
import { useFeedback } from "@/providers/FeedbackProvider";
import { useNavigate } from "react-router-dom";

export function useApi() {
  const { withLoading, showError } = useFeedback();
  const navigate = useNavigate();

  const safeRequest = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      return withLoading(async () => {
        try {
          return await fn();
        } catch (e) {
          const err = e as ApiError;
          let message = err?.message || "Có lỗi xảy ra khi kết nối máy chủ";

          // Handle different status codes
          if (err?.status === 401) {
            // Unauthorized - Token invalid or expired
            message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            // Clear auth and redirect to login
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_type");
            setTimeout(() => {
              navigate("/login", { replace: true });
            }, 1500);
          } else if (err?.status === 403) {
            // Forbidden - User doesn't have permission
            message = "Bạn không có quyền truy cập tài nguyên này.";
          } else if (err?.status === 404) {
            message = err?.message || "Không tìm thấy tài nguyên.";
          } else if (err?.status === 500) {
            message = "Lỗi máy chủ. Vui lòng thử lại sau.";
          } else {
            // Check if there are field-specific validation errors in details
            if (err?.details && typeof err.details === "object") {
              const details = err.details as Record<string, any>;

              // Check for 'detail' field (your API returns this)
              if (details.detail && typeof details.detail === "object") {
                const fieldErrors = Object.entries(details.detail)
                  .map(([field, msg]) => `${msg}`)
                  .join("\n");
                if (fieldErrors) {
                  message = fieldErrors;
                }
              }
              // Check for direct field errors in details
              else if (details.errors && typeof details.errors === "object") {
                const fieldErrors = Object.entries(details.errors)
                  .map(([field, msg]) => `${msg}`)
                  .join("\n");
                if (fieldErrors) {
                  message = fieldErrors;
                }
              }
            }
          }

          showError(message);
          return undefined;
        }
      });
    },
    [withLoading, showError, navigate]
  );

  return {
    api,
    safeRequest,
  };
}
