import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useGetRandomMotivationalQuote } from '../hooks/useQueries';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';

export default function QuotesPage() {
  const navigate = useNavigate();
  const { data: quote, isLoading, refetch } = useGetRandomMotivationalQuote();

  const handleNewQuote = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Motivational Quotes
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Get inspired with motivational quotes
              </p>
            </div>
            <Button onClick={() => navigate({ to: '/' })} className="glass-button">
              Back to Home
            </Button>
          </div>
        </div>

        {/* Quote Display */}
        <div className="glass-card rounded-2xl p-12 shadow-lg text-center space-y-8">
          <div className="flex justify-center">
            <Sparkles className="w-16 h-16 text-primary animate-pulse" />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-2xl md:text-3xl font-semibold italic glass-text leading-relaxed">
                "{quote?.text || 'No quotes available yet.'}"
              </p>
            </div>
          )}

          <Button
            onClick={handleNewQuote}
            disabled={isLoading}
            className="glass-button w-full md:w-auto px-8"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                New Quote
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        <div className="glass-card rounded-xl p-6 mt-8 shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 <strong>Tip:</strong> Motivational quotes also appear at the end of each game to celebrate your progress!
          </p>
        </div>
      </div>
    </div>
  );
}
