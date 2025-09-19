import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "./auth-client";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: string; // ✅ Added role to the User type
}

export interface Session {
  id: string;
  token: string;
  expiresAt: Date;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;

}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  refreshSession: () => Promise<User | null>; // ✅ Modified to return the user
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshSession(): Promise<User | null> {
    try {
      const result = await authClient.getSession();
      if (result.data) {
        setUser(result.data.user as User);
        setSession(result.data.session);
        return result.data.user as User; // ✅ Return the user object
      } else {
        setUser(null);
        setSession(null);
        return null; // ✅ Return null if no session
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, setUser, setSession, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}