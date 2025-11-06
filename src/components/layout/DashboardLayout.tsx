import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background h-screen overflow-y-clip">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6">
        {children}
      </main>
    </div>
  );
};
