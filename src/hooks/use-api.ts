import { useCallback } from "react";
import { api, ApiError } from "@/lib/apiClient";
import { useFeedback } from "@/providers/FeedbackProvider";

export function useApi() {
	const { withLoading, showError } = useFeedback();

	const safeRequest = useCallback(
		async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
			return withLoading(async () => {
				try {
					return await fn();
				} catch (e) {
					const err = e as ApiError;
					const message = err?.message || "Có lỗi xảy ra khi kết nối máy chủ";
					showError(message);
					return undefined;
				}
			});
		},
		[withLoading, showError],
	);

	return {
		api,
		safeRequest,
	};
}
