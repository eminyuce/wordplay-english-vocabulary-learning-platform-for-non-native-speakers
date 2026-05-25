import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  Globe,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import React from "react";

export default function NewAnalyticsPage() {
  const navigate = useNavigate();

  // Mock user progress data (will be replaced with real backend data)
  const userStats = {
    correctAnswers: 0,
    totalQuestions: 0,
    currentStreak: 0,
    lastPlayed: null as Date | null,
    totalGames: 0,
    accuracy: 0,
    xp: 0,
    level: 1,
  };

  // Mock achievement badges
  const achievements = [
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first game",
      unlocked: false,
      icon: "🎯",
    },
    {
      id: 2,
      name: "Word Master",
      description: "Answer 100 questions correctly",
      unlocked: false,
      icon: "📚",
    },
    {
      id: 3,
      name: "Streak Champion",
      description: "Maintain a 7-day streak",
      unlocked: false,
      icon: "🔥",
    },
    {
      id: 4,
      name: "Perfect Score",
      description: "Get 100% accuracy in a game",
      unlocked: false,
      icon: "⭐",
    },
  ];

  // Mock global comparison data
  const globalStats = {
    totalUsers: 0,
    totalSessions: 0,
    totalQuestionsAnswered: 0,
    averageAccuracy: 0,
    topPerformers: [] as { rank: number; name: string; score: number }[],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track your progress and compare with global statistics
              </p>
            </div>
            <Button
              onClick={() => navigate({ to: "/" })}
              variant="outline"
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              Back to Home
            </Button>
          </div>
        </div>

        {/* Backend Not Implemented Notice */}
        <Card className="mb-8 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 dark:text-yellow-400 text-2xl">
                ⚠️
              </div>
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                  Backend Analytics Not Yet Implemented
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  This dashboard is ready to display real-time analytics data.
                  Backend functions for data collection and retrieval are
                  required to populate these metrics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* User Progress Metrics */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Progress
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Correct Answers */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Correct Answers
                    </CardTitle>
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {userStats.correctAnswers}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    out of {userStats.totalQuestions} questions
                  </p>
                </CardContent>
              </Card>

              {/* Current Streak */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Current Streak
                    </CardTitle>
                    <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {userStats.currentStreak}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    consecutive days
                  </p>
                </CardContent>
              </Card>

              {/* Total Games */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Games
                    </CardTitle>
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {userStats.totalGames}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    games completed
                  </p>
                </CardContent>
              </Card>

              {/* Accuracy */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-pink-200 dark:hover:border-pink-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Accuracy
                    </CardTitle>
                    <Target className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {userStats.accuracy.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    overall accuracy
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card className="shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Experience Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userStats.xp} XP
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Level {userStats.level}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Last Played
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userStats.lastPlayed
                      ? userStats.lastPlayed.toLocaleDateString()
                      : "Never"}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {userStats.lastPlayed
                      ? "Keep your streak going!"
                      : "Start playing to track progress"}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userStats.totalQuestions > 0
                      ? (
                          (userStats.correctAnswers /
                            userStats.totalQuestions) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {userStats.correctAnswers} / {userStats.totalQuestions}{" "}
                    correct
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Achievement Badges */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Achievement Badges
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`shadow-lg transition-all ${
                    achievement.unlocked
                      ? "border-2 border-purple-400 dark:border-purple-600 shadow-purple-200 dark:shadow-purple-900"
                      : "opacity-60 grayscale"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold">
                          {achievement.name}
                        </CardTitle>
                        {achievement.unlocked && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                              Unlocked
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs">
                      {achievement.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Global Comparison Statistics */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Global Statistics
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Users
                    </CardTitle>
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {globalStats.totalUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    active learners
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Sessions
                    </CardTitle>
                    <BarChart3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {globalStats.totalSessions.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    games played
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Questions Answered
                    </CardTitle>
                    <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {globalStats.totalQuestionsAnswered.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    globally
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Average Accuracy
                    </CardTitle>
                    <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {globalStats.averageAccuracy.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    worldwide
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard Section */}
            <Card className="shadow-lg mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Global Leaderboard
                </CardTitle>
                <CardDescription>Top performers this week</CardDescription>
              </CardHeader>
              <CardContent>
                {globalStats.topPerformers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      No leaderboard data available yet.
                    </p>
                    <p className="text-xs mt-1">
                      Start playing to compete for the top spot!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {globalStats.topPerformers.map((performer) => (
                      <div
                        key={performer.rank}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              performer.rank === 1
                                ? "bg-amber-400 text-white"
                                : performer.rank === 2
                                  ? "bg-gray-400 text-white"
                                  : performer.rank === 3
                                    ? "bg-orange-400 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {performer.rank}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {performer.name}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {performer.score.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
