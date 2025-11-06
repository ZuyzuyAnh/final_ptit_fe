import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/apiClient";

export type UserType = "admin" | "organizer" | null;

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: UserProfile | null;
  userType: UserType;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfile, userType: "admin" | "organizer") => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUserType = localStorage.getItem("user_type") as UserType;
    
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      setToken(storedToken);
      
      // Try to get user profile based on stored user type
      if (storedUserType === "admin") {
        const response = await api.get<{ status: number; success: boolean; message: string; data: UserProfile }>("/admin/auth/me");
        const profile = response?.data || response;
        if (profile) {
          setUser(profile);
          setUserType("admin");
        } else {
          throw new Error("Failed to get admin profile");
        }
      } else if (storedUserType === "organizer") {
        const response = await api.get<{ status: number; success: boolean; message: string; data: UserProfile }>("/organizer/auth/me");
        const profile = response?.data || response;
        if (profile) {
          setUser(profile);
          setUserType("organizer");
        } else {
          throw new Error("Failed to get organizer profile");
        }
      } else {
        // Try both if user type is not stored
        try {
          const response = await api.get<{ status: number; success: boolean; message: string; data: UserProfile }>("/admin/auth/me");
          const profile = response?.data || response;
          if (profile) {
            setUser(profile);
            setUserType("admin");
            localStorage.setItem("user_type", "admin");
          }
        } catch {
          try {
            const response = await api.get<{ status: number; success: boolean; message: string; data: UserProfile }>("/organizer/auth/me");
            const profile = response?.data || response;
            if (profile) {
              setUser(profile);
              setUserType("organizer");
              localStorage.setItem("user_type", "organizer");
            }
          } catch {
            throw new Error("Not authenticated");
          }
        }
      }
    } catch (error) {
      // Token is invalid, clear everything
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_type");
      setToken(null);
      setUser(null);
      setUserType(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, userProfile: UserProfile, type: "admin" | "organizer") => {
    setToken(newToken);
    setUser(userProfile);
    setUserType(type);
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("user_type", type);
  };

  const logout = async () => {
    try {
      const currentToken = localStorage.getItem("auth_token");
      const currentUserType = localStorage.getItem("user_type") as UserType;
      if (currentToken) {
        // Try to logout from backend
        try {
          if (currentUserType === "admin") {
            await api.post("/admin/auth/logout");
          } else if (currentUserType === "organizer") {
            await api.post("/organizer/auth/logout");
          }
        } catch (error) {
          // Ignore logout errors, still clear local state
          console.error("Logout error:", error);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_type");
      setToken(null);
      setUser(null);
      setUserType(null);
      // Redirect will be handled by ProtectedRoute or components
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

