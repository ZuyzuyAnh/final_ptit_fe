import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { FeedbackProvider } from "./providers/FeedbackProvider";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
	<FeedbackProvider>
		<App />
		<Toaster />
	</FeedbackProvider>,
);
