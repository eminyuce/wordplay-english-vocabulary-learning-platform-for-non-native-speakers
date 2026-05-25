import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, Loader2, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { type Feedback, FeedbackCategory, FeedbackStatus } from "../../backend";
import {
  useDeleteFeedback,
  useGetAllFeedback,
  useMarkFeedbackCompleted,
} from "../../hooks/useQueries";

export default function FeedbackManagement() {
  const [statusFilter, setStatusFilter] = useState<"all" | FeedbackStatus>(
    "all",
  );

  const { data: allFeedback = [], isLoading, refetch } = useGetAllFeedback();
  const markCompletedMutation = useMarkFeedbackCompleted();
  const deleteFeedbackMutation = useDeleteFeedback();

  const filteredFeedback = React.useMemo(() => {
    if (statusFilter === "all") return allFeedback;
    return allFeedback.filter((f) => f.status === statusFilter);
  }, [allFeedback, statusFilter]);

  const handleToggleStatus = async (feedback: Feedback) => {
    try {
      if (feedback.status === FeedbackStatus.pending) {
        await markCompletedMutation.mutateAsync(feedback.id);
        toast.success("Feedback marked as completed");
      } else {
        toast.info("Cannot revert completed feedback to pending");
      }
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteFeedbackMutation.mutateAsync(id);
      toast.success("Feedback deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete feedback");
    }
  };

  const getCategoryBadgeColor = (category: FeedbackCategory): string => {
    switch (category) {
      case FeedbackCategory.bug:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case FeedbackCategory.issue:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case FeedbackCategory.idea:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getCategoryLabel = (category: FeedbackCategory): string => {
    switch (category) {
      case FeedbackCategory.bug:
        return "BUG";
      case FeedbackCategory.issue:
        return "ISSUE";
      case FeedbackCategory.idea:
        return "IDEA";
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold glass-text">Feedback Management</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter:</span>
          <Select
            value={statusFilter}
            onValueChange={(value: any) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-32 glass-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-modal">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value={FeedbackStatus.pending}>Pending</SelectItem>
              <SelectItem value={FeedbackStatus.completed}>
                Completed
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feedback Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-2xl font-bold">
                {
                  allFeedback.filter((f) => f.status === FeedbackStatus.pending)
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completed
              </p>
              <p className="text-2xl font-bold">
                {
                  allFeedback.filter(
                    (f) => f.status === FeedbackStatus.completed,
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold">{allFeedback.length}</p>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold glass-text">
          Feedback Entries ({filteredFeedback.length})
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {statusFilter === "all"
              ? "No feedback entries yet."
              : `No ${statusFilter} feedback entries.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full glass-data-table">
              <thead>
                <tr>
                  <th className="text-left">Category</th>
                  <th className="text-left">Title</th>
                  <th className="text-left">Message</th>
                  <th className="text-left">Author</th>
                  <th className="text-left">Date</th>
                  <th className="text-center">Status</th>
                  <th className="text-center w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedback.map((feedback, index) => (
                  <tr
                    key={feedback.id.toString()}
                    className={`glass-table-row ${
                      index % 2 === 0
                        ? "glass-table-row-even"
                        : "glass-table-row-odd"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(
                          feedback.category,
                        )}`}
                      >
                        {getCategoryLabel(feedback.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{feedback.title}</td>
                    <td
                      className="py-3 px-4 max-w-xs truncate"
                      title={feedback.message}
                    >
                      {feedback.message}
                    </td>
                    <td className="py-3 px-4">
                      {feedback.authorName || "Anonymous"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(feedback.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        onClick={() => handleToggleStatus(feedback)}
                        disabled={feedback.status === FeedbackStatus.completed}
                        size="sm"
                        variant={
                          feedback.status === FeedbackStatus.pending
                            ? "default"
                            : "outline"
                        }
                        className={
                          feedback.status === FeedbackStatus.pending
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }
                      >
                        {feedback.status === FeedbackStatus.pending
                          ? "Mark Complete"
                          : "Completed"}
                      </Button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              title="Delete Feedback"
                            >
                              <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-modal">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="glass-text">
                                Delete Feedback?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="glass-text-muted">
                                Are you sure you want to delete this feedback
                                entry? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="glass-button-outline">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(feedback.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
