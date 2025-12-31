"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signInWithGoogle } from "@/app/auth/actions"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { LogOut, User as UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"

interface AuthButtonProps {
  user: User | null
}

export function AuthButton({ user }: AuthButtonProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  if (user) {
    const initials = user.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || user.email?.slice(0, 2).toUpperCase() || "U"

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={user.user_metadata?.avatar_url}
                alt={user.user_metadata?.full_name || user.email || "User"}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-medium">
                {user.user_metadata?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                {user.email}
              </p>
            </div>
          </div>
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <form action={signInWithGoogle}>
      <Button type="submit" variant="outline" size="sm" className="gap-2">
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="hidden sm:inline">Sign in with Google</span>
        <span className="sm:hidden">Sign in</span>
      </Button>
    </form>
  )
}
