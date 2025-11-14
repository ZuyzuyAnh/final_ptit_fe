import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuth();
  
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-background sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 border-b border-border">
            <div className="flex items-center justify-end">
              {/* <div className="flex-1 max-w-md">
                <Input
                  type="search"`
                  placeholder="Tìm kiếm..."
                  className="bg-background"
                />
              </div> */}

              <div className="flex items-center gap-4">
                <Button variant="secondary" size="icon" className="relative flex w-fit px-4">
                  <Bell className="w-5 h-5"/>
                  <p className="font-medium font-heading transition-colors text-base">Thông báo</p>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                </Button>

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="hidden lg:block text-sm">
                      <div className="font-medium text-foreground">{user?.name || "User"}</div>
                      <div className="text-muted-foreground text-xs">{user?.email || ""}</div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
