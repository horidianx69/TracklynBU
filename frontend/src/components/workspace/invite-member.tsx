import type { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { inviteMemberSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Check, Copy, Download, Mail } from "lucide-react";
import { Label } from "../ui/label";
import { useInviteMemberMutation } from "@/hooks/use-workspace";
import { toast } from "sonner";
import QRCode from "react-qr-code";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

const ROLES = ["admin", "member", "viewer"] as const;

export const InviteMemberDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
}: InviteMemberDialogProps) => {
  const [inviteTab, setInviteTab] = useState("email");
  const [linkCopied, setLinkCopied] = useState(false);

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const { mutate, isPending } = useInviteMemberMutation();

  const onSubmit = async (data: InviteMemberFormData) => {
    if (!workspaceId) return;

    mutate(
      {
        workspaceId,
        ...data,
      },
      {
        onSuccess: () => {
          toast.success("Invite sent successfully");
          form.reset();
          setInviteTab("email");
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.response.data.message);
          console.log(error);
        },
      }
    );
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/workspace-invite/${workspaceId}`
    );
    setLinkCopied(true);

    setTimeout(() => {
      setLinkCopied(false);
    }, 3000);
  };

  const handleDownloadQRCode = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `workspace-invite-${workspaceId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast.success("QR Code downloaded successfully");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const inviteLink = `${window.location.origin}/workspace-invite/${workspaceId}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to Workspace</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="email"
          value={inviteTab}
          onValueChange={setInviteTab}
        >
          <TabsList>
            <TabsTrigger value="email" disabled={isPending}>
              Send Email
            </TabsTrigger>
            <TabsTrigger value="link" disabled={isPending}>
              Share Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col space-y-6 w-full">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter email" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Role</FormLabel>
                            <FormControl>
                              <div className="flex gap-3 flex-wrap">
                                {ROLES.map((role) => (
                                  <label
                                    key={role}
                                    className="flex items-center cursor-pointer gap-2"
                                  >
                                    <input
                                      type="radio"
                                      value={role}
                                      className="peer hidden"
                                      checked={field.value === role}
                                      onChange={() => field.onChange(role)}
                                    />
                                    <span
                                      className={cn(
                                        "w-7 h-7 rounded-full  border-2 border-blue-300 flex items-center justify-center transition-all duration-300 hover:shadow-lg bg-blue-900 text-white",
                                        field.value === role &&
                                          "ring-2 ring-blue-500 ring-offset-2 "
                                      )}
                                    >
                                      {field.value === role && (
                                        <span className="w-3 h-3 rounded-full bg-white" />
                                      )}
                                    </span>
                                    <span className="capitalize">{role}</span>
                                  </label>
                                ))}
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      className="mt-6 w-full"
                      size={"lg"}
                      disabled={isPending}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="link">
            <div className="grid gap-6">
              <div className="flex flex-col items-center gap-4 p-6 bg-muted/30 rounded-lg">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <QRCode
                    id="qr-code-svg"
                    value={inviteLink}
                    size={200}
                    level="H"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Scan with your phone camera to join
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadQRCode}
                  disabled={isPending}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </div>

              {/* Link Section */}
              <div className="grid gap-2">
                <Label>Or share this link</Label>
                <div className="flex items-center space-x-2">
                  <Input readOnly value={inviteLink} />
                  <Button onClick={handleCopyInviteLink} disabled={isPending}>
                    {linkCopied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Anyone with the link can join this workspace
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
