"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { ShoppingCart, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/store/useProfile";

export default function Header() {
  const router = useRouter();
  const { user, signOut , loading} = useAuthStore();
  const {profile} = useProfile()

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <h1
          onClick={() => router.push("/")}
          className="text-2xl font-bold text-blue-700 cursor-pointer"
        >
          Xoo Store
        </h1>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {!user && !loading ? (
            <>
              <Button
                variant="outline"
                onClick={() => router.push("/auth?mode=login")}
              >
                Login
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={() => router.push("/auth?mode=signup")}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {/* Cart icon */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/cart")}
                className="hover:text-blue-600"
              >
                <ShoppingCart size={22} />
              </Button>

              {/* User avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer border border-gray-200">
                    <AvatarImage
                      src={profile?.avatar_url || ""}
                      alt="User avatar"
                    />
                    <AvatarFallback>
                      <User className="text-gray-600" size={18} />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    {profile?.full_name || "My Account"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/orders")}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
