import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Clock,
  Filter,
  MessageSquare,
  Search,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";

// Mock feedback data
const mockFeedback = [
  {
    id: 1,
    category: "bug",
    title: "Game freezes on mobile",
    message:
      "The memory match game freezes when I try to flip cards on my iPhone.",
    author: "user123",
    status: "pending",
    createdAt: "2025-01-15T10:30:00Z",
  },
  {
    id: 2,
    category: "idea",
    title: "Add dark mode toggle",
    message: "It would be great to have a dark mode option in the settings.",
    author: "anonymous",
    status: "completed",
    createdAt: "2025-01-14T15:20:00Z",
  },
  {
    id: 3,
    category: "issue",
    title: "Difficulty selector not visible",
    message:
      "The difficulty selector is hidden behind other elements on some game screens.",
    author: "learner456",
    status: "pending",
    createdAt: "2025-01-13T09:15:00Z",
  },
  {
    id: 4,
    category: "idea",
    title: "Add more languages",
    message: "Please add support for Italian and Portuguese.",
    author: "polyglot789",
    status: "pending",
    createdAt: "2025-01-12T14:45:00Z",
  },
  {
    id: 5,
    category: "bug",
    title: "Score not updating",
    message: "My score doesn't update after completing a game session.",
    author: "gamer321",
    status: "completed",
    createdAt: "2025-01-11T11:00:00Z",
  },
];

type FeedbackStatus = "all" | "pending" | "completed";

export default function AdminFeedbackViewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter feedback based on search and status
  const filteredFeedback = mockFeedback.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFeedback = filteredFeedback.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "bug":
        return <Badge variant="destructive">🐛 Bug</Badge>;
      case "issue":
        return <Badge variant="secondary">⚠️ Issue</Badge>;
      case "idea":
        return <Badge className="bg-blue-500 text-white">💡 Idea</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "completed" ? (
      <Badge className="bg-green-500 text-white">
        <CheckCircle className="w-3 h-3 mr-1" />
        Completed
      </Badge>
    ) : (
      <Badge variant="outline">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <MessageSquare className="w-12 h-12 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">Feedback Management</h1>
          <p className="text-gray-300">
            Review and manage user feedback submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-300 mb-1">Total Feedback</p>
                <p className="text-3xl font-bold text-white">
                  {mockFeedback.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-300 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {mockFeedback.filter((f) => f.status === "pending").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-300 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-400">
                  {mockFeedback.filter((f) => f.status === "completed").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  className={
                    statusFilter === "all"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "border-white/20 text-white hover:bg-white/10"
                  }
                >
                  <Filter className="w-4 h-4 mr-2" />
                  All
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  onClick={() => setStatusFilter("pending")}
                  className={
                    statusFilter === "pending"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "border-white/20 text-white hover:bg-white/10"
                  }
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === "completed" ? "default" : "outline"}
                  onClick={() => setStatusFilter("completed")}
                  className={
                    statusFilter === "completed"
                      ? "bg-green-600 hover:bg-green-700"
                      : "border-white/20 text-white hover:bg-white/10"
                  }
                >
                  Completed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Table */}
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Feedback Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                      Title
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                      Author
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                      Date
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFeedback.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                        index % 2 === 0 ? "bg-white/5" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        {getCategoryBadge(item.category)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {item.message}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {item.author}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                            onClick={() =>
                              console.log("Toggle status:", item.id)
                            }
                          >
                            {item.status === "pending"
                              ? "Mark Complete"
                              : "Mark Pending"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => console.log("Delete:", item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "border-white/20 text-white hover:bg-white/10"
                      }
                    >
                      {page}
                    </Button>
                  ),
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Note */}
        <div className="text-center">
          <p className="text-sm text-gray-400 italic">
            Note: This page displays static mock data for demonstration
            purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
