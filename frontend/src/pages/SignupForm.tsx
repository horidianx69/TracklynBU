import { useState, useTransition } from "react";
import { authClient } from "../lib/auth-client";
import { toast } from "sonner";
import { GithubIcon, Loader2, Send } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../lib/AuthContext";
export function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
    const { refreshSession } = useAuth();
  const [password, setPassword] = useState("");
  const [isPendingGithub, startGithub] = useTransition();
  const [isPendingGoogle, startGoogle] = useTransition();
  const [isPendingEmail, startEmail] = useTransition();

  async function signUpWithGithub() {
    startGithub(async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "http://localhost:5173/",

        fetchOptions: {
          onSuccess: async() =>{ toast.success("Signed up with GitHub!")
             await refreshSession();
          },
          onError: () => {toast.error("GitHub signup failed")},
        },
      });
    });
  }

  async function signUpWithGoogle() {
    startGoogle(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "http://localhost:5173/",
        fetchOptions: {
          onSuccess: async() =>{ toast.success("Signed up with Google!")
             await refreshSession();
          },
          onError: () =>{ toast.error("Google signup failed")},
        },
      });
    });
  }

  async function signUpWithEmail() {
    startEmail(async () => {
      await authClient.signUp.email(
        { email, password, name: email.split("@")[0], callbackURL: "http://localhost:5173/" },
        {
          onSuccess: async() => {
            toast.success("Account created!");
             await refreshSession();
            navigate("/");
          },
          onError: () =>{ toast.error("Signup failed")},
        }
      );
    });
  }

  return (
    <Card className="max-w-sm mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-xl">Create Account</CardTitle>
        <CardDescription>Sign up using GitHub, Google, or your Email.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">

        <Button onClick={signUpWithGithub} disabled={isPendingGithub} variant="outline" className="flex gap-2">
          {isPendingGithub ? <Loader2 className="w-4 h-4 animate-spin" /> : <GithubIcon className="w-4 h-4" />} GitHub
        </Button>

        <Button onClick={signUpWithGoogle} disabled={isPendingGoogle} variant="outline" className="flex gap-2">
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

          <Button onClick={signUpWithEmail} disabled={isPendingEmail} className="flex gap-2">
            {isPendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Sign Up
          </Button>
        </div>
        <p className="text-center text-sm mt-2">
            Already have an account? <Link to="/login" className="hover:underline">Log In</Link>
        </p>

      </CardContent>
    </Card>
  );
}
