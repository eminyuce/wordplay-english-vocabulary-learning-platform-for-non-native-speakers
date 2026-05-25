import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import AdminWordManagement from "../components/Admin/AdminWordManagement";
import { useAdminAuth } from "../hooks/useAdminAuth";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { isAdminAuthenticated, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isAdminAuthenticated && !isLoading) {
      navigate({ to: "/admin/login" });
    }
  }, [isAdminAuthenticated, isLoading, navigate]);

  if (isLoading || !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AdminWordManagement />
      </div>
    </div>
  );
}
