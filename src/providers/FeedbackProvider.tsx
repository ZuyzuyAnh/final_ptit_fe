import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";

interface FeedbackContextValue {
	isLoading: boolean;
	showLoading: () => void;
	hideLoading: () => void;
	withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
	showError: (message: string, title?: string) => void;
}

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

export const FeedbackProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [isLoading, setIsLoading] = useState(false);

	const showLoading = useCallback(() => setIsLoading(true), []);
	const hideLoading = useCallback(() => setIsLoading(false), []);

	const withLoading = useCallback(async <T,>(fn: () => Promise<T>) => {
		setIsLoading(true);
		try {
			return await fn();
		} finally {
			setIsLoading(false);
		}
	}, []);

	const showError = useCallback((message: string, title?: string) => {
		toast({
			title: title ?? "Thông báo",
			description: message,
		});
	}, []);

	const value = useMemo(
		() => ({ isLoading, showLoading, hideLoading, withLoading, showError }),
		[isLoading, showLoading, hideLoading, withLoading, showError],
	);

	return (
		<FeedbackContext.Provider value={value}>
			{children}
			<LoadingOverlay visible={isLoading} />
		</FeedbackContext.Provider>
	);
};

export function useFeedback(): FeedbackContextValue {
	const ctx = useContext(FeedbackContext);
	if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider");
	return ctx;
}
