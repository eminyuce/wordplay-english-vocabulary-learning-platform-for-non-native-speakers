import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, Menu, MessageSquare, X } from "lucide-react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Header() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme: _theme, setTheme } = useTheme();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === "logging-in";
  const authText =
    loginStatus === "logging-in"
      ? "Logging in..."
      : isAuthenticated
        ? "Logout"
        : "Login";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const isActive = (path: string) => currentPath === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#FFF7FF] dark:bg-black backdrop-blur supports-[backdrop-filter]:bg-[#FFF7FF]/95 dark:supports-[backdrop-filter]:bg-black/95 transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          WordPlay
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className={`text-sm font-medium transition-colors hover:text-primary relative pb-1 ${
              isActive("/")
                ? "text-primary dark:text-white"
                : "text-muted-foreground dark:text-gray-400"
            }`}
          >
            Home
            {isActive("/") && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-white" />
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/analytics" })}
            className={`text-sm font-medium transition-colors hover:text-primary relative pb-1 flex items-center gap-1.5 ${
              isActive("/analytics")
                ? "text-primary dark:text-white"
                : "text-muted-foreground dark:text-gray-400"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
            {isActive("/analytics") && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-white" />
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/feedback" })}
            className={`text-sm font-medium transition-colors hover:text-primary relative pb-1 flex items-center gap-1.5 ${
              isActive("/feedback")
                ? "text-primary dark:text-white"
                : "text-muted-foreground dark:text-gray-400"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Feedback
            {isActive("/feedback") && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-white" />
            )}
          </button>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-purple-200/50 dark:border-gray-700/50"
            >
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="cursor-pointer"
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="cursor-pointer"
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="cursor-pointer"
              >
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handleAuth}
            disabled={disabled}
            className={`px-6 py-2 rounded-full transition-colors font-medium ${
              isAuthenticated
                ? "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                : "bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {authText}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-purple-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-[#FFF7FF] dark:bg-black">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                navigate({ to: "/" });
                setMobileMenuOpen(false);
              }}
              className={`text-left px-4 py-2 rounded-lg transition-colors ${
                isActive("/")
                  ? "bg-purple-100 dark:bg-gray-800 text-primary dark:text-white font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                navigate({ to: "/analytics" });
                setMobileMenuOpen(false);
              }}
              className={`text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isActive("/analytics")
                  ? "bg-purple-100 dark:bg-gray-800 text-primary dark:text-white font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            <button
              type="button"
              onClick={() => {
                navigate({ to: "/feedback" });
                setMobileMenuOpen(false);
              }}
              className={`text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isActive("/feedback")
                  ? "bg-purple-100 dark:bg-gray-800 text-primary dark:text-white font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Feedback
            </button>
            <div className="flex items-center gap-2 px-4 py-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-200/50 dark:border-gray-700/50"
                  >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-purple-200/50 dark:border-gray-700/50"
                >
                  <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="cursor-pointer"
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="cursor-pointer"
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className="cursor-pointer"
                  >
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => {
                  handleAuth();
                  setMobileMenuOpen(false);
                }}
                disabled={disabled}
                className={`flex-1 rounded-full transition-colors font-medium ${
                  isAuthenticated
                    ? "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                    : "bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                } disabled:opacity-50`}
              >
                {authText}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
