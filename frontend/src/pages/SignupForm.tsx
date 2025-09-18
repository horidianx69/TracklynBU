import { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isPendingEmail, startEmail] = useTransition();
  // ✅ Initialize useNavigate
  const navigate = useNavigate();
  async function signUpWithEmail() {
    startEmail(async () => {
      await authClient.signUp.email(
        {
          email,
          password,
          name: email.split("@")[0],
          role: "student",
        },
        {
          onSuccess: () => {
            // ✅ Inform the user to verify their email
            toast.info("Account created! Please check your email to verify your account.");
             navigate("/verify-email");
          },
          onError: (data) => {
            console.log(data.error)
             switch (data.error.status) {
              case 409: // Conflict
                toast.error("A user with this email already exists.");
                break;
              case 400: // Bad Request (e.g., short password, invalid email)
                // Use the specific message from the backend if available
                toast.error(data.error.message || "Please check your email or password.");
                break;
              default:
                toast.error(data.error.message || "An unexpected error occurred.");
            }
          },
        }
      );
    });
  }

  return (

     <div className="flex-grow flex items-center justify-center">

    <Card className="w-full max-w-sm ">
      <CardHeader>
        <CardTitle className="text-xl">Create Student Account</CardTitle>
        <CardDescription>
          Use your official Bennett email or sign up with a password.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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
            {isPendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Sign Up with Email
          </Button>
        </div>
        <p className="text-center text-sm mt-2">
          Already have an account? <Link to="/login" className="hover:underline">Log In</Link>
        </p>
      </CardContent>
    </Card>
     </div>
  );
}