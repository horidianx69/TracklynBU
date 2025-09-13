import { useState, useTransition } from "react";
import { authClient } from "../lib/auth-client";
import { toast } from "sonner";
import { GithubIcon, Loader2, LogIn } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export function LoginForm() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPendingGithub, startGithub] = useTransition();
  const [isPendingGoogle, startGoogle] = useTransition();
  const [isPendingEmail, startEmail] = useTransition();

  async function signInWithGithub() {
    startGithub(async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "http://localhost:5173/",
        fetchOptions: {
          onSuccess: async () => {
            toast.success("Signed in with GitHub!");
            await refreshSession();
            navigate("/");
          },
          onError: () => {toast.error("GitHub login failed")},
        },
      });
    });
  }

  async function signInWithGoogle() {
    startGoogle(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "http://localhost:5173/",
        fetchOptions: {
          onSuccess: async () => {
            toast.success("Signed in with Google!");
            await refreshSession();
            navigate("/");
          },
          onError: () => {toast.error("Google login failed")},
        },
      });
    });
  }

  async function signInWithEmail() {
    startEmail(async () => {
      await authClient.signIn.email(
        { email, password },
       {
          onSuccess: async () => {
            toast.success("Logged in successfully!");
            await refreshSession();
            navigate("/");
          },
          onError: () => {toast.error("Invalid credentials")},
        }
      );
    });
  }
  
  return (
    <Card className="max-w-sm mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-xl">Welcome Back!</CardTitle>
        <CardDescription>Log in with GitHub, Google, or your Email account.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={signInWithGithub} disabled={isPendingGithub} variant="outline" className="flex gap-2">
          {isPendingGithub ? <Loader2 className="w-4 h-4 animate-spin" /> : <GithubIcon className="w-4 h-4" />} GitHub
        </Button>

        <Button onClick={signInWithGoogle} disabled={isPendingGoogle} variant="outline" className="flex gap-2">
          {isPendingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : <FcGoogle className="w-4 h-4" />} Google
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:flex after:items-center after:border-t">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">or continue with email</span>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <Button onClick={signInWithEmail} disabled={isPendingEmail} className="flex gap-2">
            {isPendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} Login
          </Button>
        </div>

        <p className="text-center text-sm mt-2">
          Don't have an account? <Link to="/signup" className="hover:underline">Create one</Link>
        </p>
      </CardContent>
    </Card>
  );
}
