import { Button } from "./ui/button";
import { Shield, LogIn, User, LogOut, Home, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface HeaderProps {
  isAuthenticated?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogin?: () => void;
  onLogout?: () => void;
  onProfile?: () => void;
}

export default function Header({
  isAuthenticated = false,
  user,
  onLogin,
  onLogout,
  onProfile,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-app-name">IronCrypt</h1>
        </div>

        {/* Taskbar navigation */}
        <nav className="flex gap-2 items-center">
          <Button variant="ghost" onClick={() => window.location.href = "/"} data-testid="nav-home">
            <Home className="h-5 w-5 mr-1" /> Home
          </Button>
          <Button variant="ghost" onClick={() => window.location.href = "/dashboard"} data-testid="nav-dashboard">
            <LayoutDashboard className="h-5 w-5 mr-1" /> Dashboard
          </Button>
          {isAuthenticated && user && (
            <Button variant="ghost" onClick={() => window.location.href = "/profile"} data-testid="nav-profile">
              <User className="h-5 w-5 mr-1" /> Profile
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline" data-testid="text-user-name">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = "/profile"} data-testid="menu-item-profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} data-testid="menu-item-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button onClick={onLogin} data-testid="button-login" variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button onClick={() => window.location.href = "/register"} data-testid="button-signup" variant="default">
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
