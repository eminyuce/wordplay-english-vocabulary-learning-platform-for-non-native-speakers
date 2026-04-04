import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useGetAnalyticsData } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, TrendingUp, Users, Target, Award, Zap, Globe, LogIn } from 'lucide-react';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { data: analyticsData, isLoading } = useGetAnalyticsData();
  const { identity, login } = useInternetIdentity();

  const isAuthenticated = !!identity;

  const personal = analyticsData?.personal ?? {
    totalGames: 0,
    accuracy: 0,
    streak: 0,
    xp: 0,
    mostPlayedGameMode: 'N/A',
    totalCorrect: 0,
    totalAnswered: 0,
  };

  const global = analyticsData?.global ?? {
    totalUsers: 0,
    totalSessions: 0,
    totalQuestionsAnswered: 0,
    averageAccuracy: 0,
  };

  const gameMode = analyticsData?.gameMode ?? {
    gameModePlays: [] as [string, number][],
    averageScores: [] as [string, number][],
    averageAccuracy: [] as [string, number][],
  };

  const language = analyticsData?.language ?? {
    wordsAttempted: [] as [string, number][],
    gamesPlayed: [] as [string, number][],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Track your progress and compare with global statistics
              </p>
            </div>
            <Button onClick={() => navigate({ to: '/' })} className="glass-button">
              Back to Home
            </Button>
          </div>
        </div>

        {/* Guest Mode Banner */}
        {!isAuthenticated && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <LogIn className="inline w-4 h-4 mr-2" />
                <strong>Log in to track your personal progress!</strong> Anonymous users can view global statistics only.
              </p>
              <Button onClick={login} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Log In
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Personal Statistics - Only for authenticated users */}
            {isAuthenticated && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold glass-text flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Your Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Games</p>
                        <p className="text-2xl font-bold">{personal.totalGames}</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Target className="w-6 h-6 text-green-600 dark:text-green-300" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                        <p className="text-2xl font-bold">{personal.accuracy.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <Zap className="w-6 h-6 text-orange-600 dark:text-orange-300" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                        <p className="text-2xl font-bold">{personal.streak}</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Award className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
                        <p className="text-2xl font-bold">{personal.xp}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Personal Stats */}
                <div className="glass-card rounded-xl p-6 shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Most Played Mode
                      </p>
                      <p className="text-xl font-semibold">{personal.mostPlayedGameMode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Correct Answers
                      </p>
                      <p className="text-xl font-semibold">
                        {personal.totalCorrect} / {personal.totalAnswered}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Success Rate
                      </p>
                      <p className="text-xl font-semibold">
                        {personal.totalAnswered > 0
                          ? ((personal.totalCorrect / personal.totalAnswered) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Global Statistics */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold glass-text flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                Global Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                      <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold">{global.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-pink-600 dark:text-pink-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
                      <p className="text-2xl font-bold">{global.totalSessions}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                      <Target className="w-6 h-6 text-cyan-600 dark:text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Questions Answered</p>
                      <p className="text-2xl font-bold">{global.totalQuestionsAnswered}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-lg">
                      <Award className="w-6 h-6 text-teal-600 dark:text-teal-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Accuracy</p>
                      <p className="text-2xl font-bold">{global.averageAccuracy.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Mode Analytics - Placeholder for future implementation */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold glass-text">Game Mode Performance</h2>
              <div className="glass-card rounded-xl p-6 shadow-lg">
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="mb-2">Game mode analytics coming soon!</p>
                  <p className="text-sm">Detailed performance metrics per game mode will be available in a future update.</p>
                </div>
              </div>
            </div>

            {/* Language Analytics - Placeholder for future implementation */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold glass-text">Language Performance</h2>
              <div className="glass-card rounded-xl p-6 shadow-lg">
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="mb-2">Language analytics coming soon!</p>
                  <p className="text-sm">Detailed performance metrics per language will be available in a future update.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

