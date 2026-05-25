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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { MotivationalQuote } from "../../backend";
import {
  useAddMotivationalQuote,
  useBulkAddMotivationalQuotes,
  useDeleteMotivationalQuote,
  useGetAllMotivationalQuotes,
  useUpdateMotivationalQuote,
} from "../../hooks/useQueries";

export default function MotivationalQuotesManagement() {
  const [newQuote, setNewQuote] = useState("");
  const [bulkQuotes, setBulkQuotes] = useState("");
  const [editingQuote, setEditingQuote] = useState<MotivationalQuote | null>(
    null,
  );
  const [editText, setEditText] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);

  const {
    data: quotes = [],
    isLoading,
    refetch,
  } = useGetAllMotivationalQuotes();
  const addQuoteMutation = useAddMotivationalQuote();
  const bulkAddMutation = useBulkAddMotivationalQuotes();
  const updateQuoteMutation = useUpdateMotivationalQuote();
  const deleteQuoteMutation = useDeleteMotivationalQuote();

  const handleAddQuote = async () => {
    if (!newQuote.trim()) {
      toast.error("Please enter a quote");
      return;
    }

    try {
      await addQuoteMutation.mutateAsync(newQuote.trim());
      toast.success("Quote added successfully");
      setNewQuote("");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to add quote");
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkQuotes.trim()) {
      toast.error("Please enter quotes (one per line)");
      return;
    }

    const quotesArray = bulkQuotes
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    if (quotesArray.length === 0) {
      toast.error("No valid quotes found");
      return;
    }

    try {
      await bulkAddMutation.mutateAsync(quotesArray);
      toast.success(`${quotesArray.length} quotes added successfully`);
      setBulkQuotes("");
      setShowBulkInput(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to add quotes");
    }
  };

  const handleEditQuote = (quote: MotivationalQuote) => {
    setEditingQuote(quote);
    setEditText(quote.text);
  };

  const handleUpdateQuote = async () => {
    if (!editingQuote || !editText.trim()) {
      toast.error("Please enter a quote");
      return;
    }

    try {
      await updateQuoteMutation.mutateAsync({
        id: editingQuote.id,
        text: editText.trim(),
      });
      toast.success("Quote updated successfully");
      setEditingQuote(null);
      setEditText("");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update quote");
    }
  };

  const handleDeleteQuote = async (id: bigint) => {
    try {
      await deleteQuoteMutation.mutateAsync(id);
      toast.success("Quote deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete quote");
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold glass-text">
          Motivational Quotes Management
        </h2>
        <Button
          onClick={() => setShowBulkInput(!showBulkInput)}
          className="glass-button"
        >
          {showBulkInput ? "Single Quote" : "Bulk Add"}
        </Button>
      </div>

      {/* Add Single Quote */}
      {!showBulkInput && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Add New Quote</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter a motivational quote..."
              value={newQuote}
              onChange={(e) => setNewQuote(e.target.value)}
              className="glass-input flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddQuote();
                }
              }}
            />
            <Button
              onClick={handleAddQuote}
              disabled={addQuoteMutation.isPending || !newQuote.trim()}
              className="glass-button"
            >
              {addQuoteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Add Quotes */}
      {showBulkInput && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Bulk Add Quotes (One Per Line)
          </Label>
          <Textarea
            placeholder="Enter quotes, one per line..."
            value={bulkQuotes}
            onChange={(e) => setBulkQuotes(e.target.value)}
            className="glass-input min-h-[200px]"
          />
          <Button
            onClick={handleBulkAdd}
            disabled={bulkAddMutation.isPending || !bulkQuotes.trim()}
            className="glass-button w-full"
          >
            {bulkAddMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Quotes...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add All Quotes
              </>
            )}
          </Button>
        </div>
      )}

      {/* Quotes List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold glass-text">
          All Quotes ({quotes.length})
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No quotes yet. Add your first motivational quote above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full glass-data-table">
              <thead>
                <tr>
                  <th className="text-left">Quote</th>
                  <th className="text-center w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote, index) => (
                  <tr
                    key={quote.id.toString()}
                    className={`glass-table-row ${
                      index % 2 === 0
                        ? "glass-table-row-even"
                        : "glass-table-row-odd"
                    }`}
                  >
                    <td className="py-3 px-4">{quote.text}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={() => handleEditQuote(quote)}
                          size="sm"
                          variant="ghost"
                          className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          title="Edit Quote"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              title="Delete Quote"
                            >
                              <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-modal">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="glass-text">
                                Delete Quote?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="glass-text-muted">
                                Are you sure you want to delete this quote? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="glass-button-outline">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteQuote(quote.id)}
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

      {/* Edit Quote Dialog */}
      {editingQuote && (
        <AlertDialog
          open={!!editingQuote}
          onOpenChange={() => setEditingQuote(null)}
        >
          <AlertDialogContent className="glass-modal">
            <AlertDialogHeader>
              <AlertDialogTitle className="glass-text">
                Edit Quote
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-3 py-4">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="glass-input min-h-[100px]"
                placeholder="Enter quote text..."
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="glass-button-outline">
                Cancel
              </AlertDialogCancel>
              <Button
                onClick={handleUpdateQuote}
                disabled={updateQuoteMutation.isPending || !editText.trim()}
                className="glass-button"
              >
                {updateQuoteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Quote"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
