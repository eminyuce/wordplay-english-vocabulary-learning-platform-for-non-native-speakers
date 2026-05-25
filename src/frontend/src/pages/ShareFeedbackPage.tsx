import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, MessageSquare, Send } from "lucide-react";
import type React from "react";
import { useState } from "react";

type FeedbackCategory = "bug" | "issue" | "idea";

export default function ShareFeedbackPage() {
  const [category, setCategory] = useState<FeedbackCategory>("idea");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; message?: string }>(
    {},
  );

  const validateForm = () => {
    const newErrors: { title?: string; message?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!message.trim()) {
      newErrors.message = "Message is required";
    } else if (message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Simulate submission (no backend integration)
    console.log("Feedback submitted:", { category, title, message });
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setCategory("idea");
      setTitle("");
      setMessage("");
      setErrors({});
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-2 border-green-200 dark:border-green-700 shadow-2xl">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Thank You!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your feedback has been submitted successfully. We appreciate your
              input!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <MessageSquare className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Share Your Feedback
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Help us improve WordPlay by sharing your thoughts, reporting bugs,
            or suggesting new ideas
          </p>
        </div>

        {/* Feedback Form */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-xl border-2 border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">
              Submit Feedback
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              All fields are required. Your feedback helps us make WordPlay
              better for everyone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Category *
                </Label>
                <Select
                  value={category}
                  onValueChange={(value) =>
                    setCategory(value as FeedbackCategory)
                  }
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">🐛 Bug Report</SelectItem>
                    <SelectItem value="issue">⚠️ Issue</SelectItem>
                    <SelectItem value="idea">💡 Idea / Suggestion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Brief summary of your feedback"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full ${errors.title ? "border-red-500 focus:ring-red-500" : ""}`}
                  maxLength={100}
                />
                <div className="flex justify-between items-center">
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {title.length}/100
                  </p>
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
                <Label
                  htmlFor="message"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Message *
                </Label>
                <Textarea
                  id="message"
                  placeholder="Provide detailed information about your feedback..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full min-h-[150px] resize-y ${errors.message ? "border-red-500 focus:ring-red-500" : ""}`}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center">
                  {errors.message && (
                    <p className="text-xs text-red-500">{errors.message}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {message.length}/1000
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Note: This is a UI demonstration. No backend integration is
            implemented yet.
          </p>
        </div>
      </div>
    </div>
  );
}
