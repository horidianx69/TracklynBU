import type { User } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "./react-query-provider";
import { useLocation, useNavigate } from "react-router";
import { publicRoutes } from "@/lib";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  console.log("Current Pathname:", pathname);
  const isPublicRoute = publicRoutes.includes(pathname);

  // check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
          const parsedUser: User = JSON.parse(storedUser);

          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log(pathname);

          // 🧠 Handle email verification route
          if (!parsedUser.isEmailVerified && pathname.startsWith("/verify-email")) {
            navigate("/verify-email");
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          // ✅ Only redirect if not public and not already signing in
          if (!isPublicRoute &&pathname.startsWith("/verify-email")) {
            navigate("/sign-in");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname]);

  useEffect(() => {
    const handleLogout = () => {
      logout();
      navigate("/sign-in");
    };
    window.addEventListener("force-logout", handleLogout);
    return () => window.removeEventListener("force-logout", handleLogout);
  }, []);

  const login = async (data: any) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);

    // Redirect logic on login
    if (!data.user.isEmailVerified) {
      navigate("/verify-email");
    } else {
      navigate("/dashboard");
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);

    queryClient.clear();
  };

  const values = { user, isAuthenticated, isLoading, login, logout };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
