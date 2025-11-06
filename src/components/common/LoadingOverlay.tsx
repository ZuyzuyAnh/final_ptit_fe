import React from "react";

interface LoadingOverlayProps {
	visible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible }) => {
	if (!visible) return null;

	return (
		<div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
			<div
				className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white"
				aria-live="polite"
				aria-busy="true"
				role="status"
			>
				<span className="sr-only">Loading...</span>
			</div>
		</div>
	);
};

export default LoadingOverlay;
