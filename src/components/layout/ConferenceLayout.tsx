import { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { ConferenceSidebar } from "@/components/conference/ConferenceSidebar";
import { cn } from "@/lib/utils";

interface ConferenceLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  sidebarTitle?: string;
}

export const ConferenceLayout = ({ children, showSidebar = true, sidebarTitle }: ConferenceLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex">
        {showSidebar && <ConferenceSidebar title={sidebarTitle} />}
        <main className={cn("flex-1", showSidebar ? "" : "max-w-7xl mx-auto")}>
          {children}
        </main>
      </div>
    </div>
  );
};
