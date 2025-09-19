import { useNavigate } from "react-router";
import { useTransition } from "react";
import { toast } from "sonner";
import { authClient } from "../lib/auth-client";
import { useAuth } from "../lib/AuthContext";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const { user, session, loading, setUser, setSession } = useAuth();
  const [isSigningOut, startSignOut] = useTransition();
  const navigate = useNavigate();

  const handleSignOut = () => {
    startSignOut(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Clear context values on logout
            setUser(null);
            setSession(null);

            toast.success("Signed out successfully!");
            navigate("/login");
          },
          onError: () => {
            toast.error("Sign out failed");
          },
        },
      });
    });
  };

  if (loading) return <div>Loading session...</div>;
  if (!user || !session) return <div>Please log in to access this page</div>;

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center gap-4">
        <span className="font-medium">Signed in as: {user.email}</span>
        <Button
          onClick={handleSignOut}
          disabled={isSigningOut}
          variant={"destructive"}
        >
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
