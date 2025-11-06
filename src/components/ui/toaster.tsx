import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { AlertTriangle } from "lucide-react";

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map(function ({ id, title, description, action, ...props }) {
				return (
					<Toast
						key={id}
						{...props}
						className={(props.className ?? "") + " bg-white/95 backdrop-blur border text-foreground"}
					>
						<div className="flex items-start gap-3">
							<div className="mt-0.5 rounded-full bg-muted p-1.5 text-foreground/80">
								<AlertTriangle className="h-5 w-5" />
							</div>
							<div className="grid gap-1">
								{title && <ToastTitle>{title}</ToastTitle>}
								{description && <ToastDescription>{description}</ToastDescription>}
							</div>
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}
