import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { useSubmitFeedback } from '../hooks/useQueries';
import { FeedbackCategory } from '../backend';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<FeedbackCategory>(FeedbackCategory.idea);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [authorName, setAuthorName] = useState('');

  const submitFeedbackMutation = useSubmitFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await submitFeedbackMutation.mutateAsync({
        category,
        title: title.trim(),
        message: message.trim(),
        authorName: authorName.trim() || null,
      });
      toast.success('Feedback submitted successfully! Thank you for your input.');
      setTitle('');
      setMessage('');
      setAuthorName('');
      setCategory(FeedbackCategory.idea);
      
      // Navigate back to home after successful submission
      setTimeout(() => {
        navigate({ to: '/' });
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit feedback');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="glass-card rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold glass-text">Share Your Feedback</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Help us improve WordPlay by sharing your thoughts
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category *
              </Label>
              <Select value={category} onValueChange={(value: FeedbackCategory) => setCategory(value)}>
                <SelectTrigger id="category" className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-modal">
                  <SelectItem value={FeedbackCategory.bug}>🐛 Bug Report</SelectItem>
                  <SelectItem value={FeedbackCategory.issue}>⚠️ Issue</SelectItem>
                  <SelectItem value={FeedbackCategory.idea}>💡 Feature Idea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Author Name Input (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="authorName" className="text-sm font-medium">
                Your Name (Optional)
              </Label>
              <Input
                id="authorName"
                placeholder="Enter your name (optional)..."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="glass-input"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {authorName.length}/50 characters
              </p>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title *
              </Label>
              <Input
                id="title"
                placeholder="Brief summary of your feedback..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {title.length}/100 characters
              </p>
            </div>

            {/* Message Textarea */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message *
              </Label>
              <Textarea
                id="message"
                placeholder="Describe your feedback in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="glass-input min-h-[200px]"
                maxLength={1000}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {message.length}/1000 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => navigate({ to: '/' })}
                variant="outline"
                className="glass-button-outline flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitFeedbackMutation.isPending || !title.trim() || !message.trim()}
                className="glass-button flex-1"
              >
                {submitFeedbackMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
