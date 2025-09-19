import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MailCheck } from "lucide-react";

export function VerifyEmailPage() {
  return (
    <Card className="max-w-md mx-auto mt-20 text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <MailCheck className="w-16 h-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl">Check Your Inbox!</CardTitle>
        <CardDescription>
          We've sent a verification link to your email address. Please click the link to complete your registration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          You can safely close this page. Once you verify, you'll be able to log in.
        </p>
      </CardContent>
    </Card>
  );
}