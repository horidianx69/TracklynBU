import { useCallback, useEffect, useState, useTransition } from "react";
import { authClient } from "../lib/auth-client";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
type User = {
  role: string;
};

export function LoginForm() {
  const navigate = useNavigate();
  const { refreshSession, user } = useAuth() as {
    refreshSession: () => Promise<User | null>;
    user: User | null;
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPendingEmail, startEmail] = useTransition();

  // 2. Wrap the function in useCallback
  const handleLoginSuccess = useCallback(
    async (currentUser?: User | null) => {
      const userToRedirect = currentUser || (await refreshSession());
      if (!userToRedirect) {
        // ...
        return;
      }
      switch (userToRedirect.role) {
        case "admin":
          navigate("/admindashboard");
          break;
        case "teacher":
          navigate("/teacherdashboard");
          break;
        case "student":
          navigate("/studentdashboard");
          break;

        default:
          navigate("/");
      }
    },
    [navigate, refreshSession]
  );

  useEffect(() => {
    if (user) {
      toast.success("Verification successful! Welcome as " + user.role);

      console.log(user);
      handleLoginSuccess(user);
    }
  }, [user, handleLoginSuccess]);

  async function signInWithEmail() {
    startEmail(async () => {
      await authClient.signIn.email(
        { email, password },
        {
          onSuccess: async () => {
            toast.success("Logged in successfully!");
            await handleLoginSuccess();
          },
          onError: (data) => {
            console.error("Login Error:", data.error);

            switch (data.error.status) {
              case 403: // Forbidden
                toast.error("Please verify your email before logging in.");
                break;
              case 401: // Unauthorized
              case 400: // Bad Request
                toast.error("Invalid email or password. Please try again.");
                break;
              default:
                toast.error(
                  data.error.message || "An unexpected login error occurred."
                );
            }
          },
        }
      );
    });
  }

  return (
    <div className="flex-grow flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Welcome Back!</CardTitle>
          <CardDescription>Log in with your credentials.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={signInWithEmail}
              disabled={isPendingEmail}
              className="flex gap-2"
            >
              {isPendingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              Login
            </Button>
          </div>
          <p className="text-center text-sm mt-2">
            Don't have an account?{" "}
            <Link to="/signup" className="hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
