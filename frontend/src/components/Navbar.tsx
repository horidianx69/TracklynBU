import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/mode-toggle";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useTransition } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export default function Navbar() {
  const { user, setUser, setSession } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, startSignOut] = useTransition();

  const handleSignOut = () => {
    startSignOut(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setUser(null);
            setSession(null);
            toast.success("Signed out successfully");
            navigate("/login");
          },
          onError: () => {
            toast.error("Sign out failed");
          },
        },
      });
    });
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b bg-background gap-3">
      {/* Left: Logo + Nav links */}
      <div className="flex items-center justify-between sm:gap-4 md:gap-6 lg:gap-8">
        <Link to="/">
          <h1 className="text-xl font-bold">Tracklyn</h1>
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/" className="px-3 py-2 text-sm font-medium">
                  Home
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/about" className="px-3 py-2 text-sm font-medium">
                  About
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/contact" className="px-3 py-2 text-sm font-medium">
                  Contact
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Right: If logged in → avatar & logout | else → login & signup */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={
                    user.image ||
                    `https://avatar.vercel.sh/${encodeURIComponent(
                      user.name || user.email
                    )}`
                  }
                  alt={user.name || user.email}
                />
                <AvatarFallback>
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name || user.email}</span>
            </div>

            <Button
              onClick={handleSignOut}
              disabled={isSigningOut}
              variant="destructive"
              size="sm"
            >
              {isSigningOut ? "Logging out..." : "Logout"}
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Login</Link>
            </Button>

            <Button asChild size="sm">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </>
        )}

        <ModeToggle />
      </div>
    </div>
  );
}
