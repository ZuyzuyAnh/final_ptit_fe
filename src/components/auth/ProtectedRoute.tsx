import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: "admin" | "organizer" | "system_user";
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredUserType,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    userType,
    user,
    isGlobalAdmin,
    isOrganizerScoped,
  } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredUserType) {
    // Admin routes: accessible by global admins (scope: GLOBAL)
    const isAdminRoute =
      requiredUserType === "admin" || requiredUserType === "system_user";
    const isAdminUser = userType === "admin" || userType === "system_user";

    if (isAdminRoute) {
      // For admin routes, check if user has global scope
      if (!isGlobalAdmin()) {
        // Organizer-scoped admins should go to organizer dashboard
        if (userType === "organizer" || isOrganizerScoped()) {
          return <Navigate to="/dashboard" replace />;
        }
        return <Navigate to={redirectTo} replace />;
      }
    }

    // Organizer routes: accessible by organizers AND organizer-scoped admins
    if (requiredUserType === "organizer") {
      // Allow regular organizers or organizer-scoped system users
      const hasOrganizerAccess =
        userType === "organizer" || isOrganizerScoped() || isGlobalAdmin(); // Global admins can access everything

      if (!hasOrganizerAccess) {
        // Non-organizer trying to access organizer route
        if (isAdminUser) {
          return <Navigate to="/admin" replace />;
        }
        return <Navigate to={redirectTo} replace />;
      }
    }
  }

  return <>{children}</>;
}
