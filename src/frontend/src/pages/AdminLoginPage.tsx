import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import React, { useEffect } from "react";
import AdminLoginForm from "../components/Admin/AdminLoginForm";
import { useAdminAuth } from "../hooks/useAdminAuth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { isAdminAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate({ to: "/admin" });
    }
  }, [isAdminAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/" })}
            className="hover:bg-purple-100 dark:hover:bg-purple-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Admin Login
          </h1>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
