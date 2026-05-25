import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Target, TrendingUp, Trophy, Users, Zap } from "lucide-react";
import React from "react";

// Mock data for analytics
const mockUserProgress = {
  totalGames: 42,
  streak: 7,
  accuracy: 85.5,
  xp: 3420,
  level: 12,
  correctAnswers: 358,
  totalAnswers: 419,
};

const mockGlobalStats = {
  totalUsers: 1247,
  totalSessions: 8934,
  averageAccuracy: 78.2,
  totalQuestionsAnswered: 125678,
};

const mockScoreTrends = [
  { date: "Mon", score: 75 },
  { date: "Tue", score: 82 },
  { date: "Wed", score: 78 },
  { date: "Thu", score: 88 },
  { date: "Fri", score: 85 },
  { date: "Sat", score: 90 },
  { date: "Sun", score: 87 },
];

const mockGameModeStats = [
  { mode: "Meaning Match", plays: 15, accuracy: 88 },
  { mode: "Reverse Meaning", plays: 12, accuracy: 82 },
  { mode: "Gap Fill", plays: 10, accuracy: 85 },
  { mode: "Flashcards", plays: 8, accuracy: 90 },
  { mode: "Memory Match", plays: 7, accuracy: 79 },
];

export default function AnalyticsDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your learning progress and compare with global statistics
          </p>
        </div>

        {/* User Progress Metrics */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Your Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Total Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {mockUserProgress.totalGames}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Keep playing to improve!
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-orange-200 dark:border-orange-700 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {mockUserProgress.streak} days
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Amazing consistency!
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-green-200 dark:border-green-700 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {mockUserProgress.accuracy}%
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {mockUserProgress.correctAnswers} /{" "}
                  {mockUserProgress.totalAnswers} correct
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Experience Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {mockUserProgress.xp} XP
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Level {mockUserProgress.level}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Score Trends */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Score Trends (Last 7 Days)
          </h2>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-end justify-between h-48 gap-2">
                {mockScoreTrends.map((day, _index) => (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all hover:from-purple-600 hover:to-pink-600"
                      style={{ height: `${day.score}%` }}
                    />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {day.date}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {day.score}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Global Comparison */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Global Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockGlobalStats.totalUsers.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockGlobalStats.totalSessions.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Average Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockGlobalStats.averageAccuracy}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Questions Answered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockGlobalStats.totalQuestionsAnswered.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Game Mode Performance */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Game Mode Performance
          </h2>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Game Mode
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Plays
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Accuracy
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockGameModeStats.map((stat, _index) => (
                      <tr
                        key={stat.mode}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                          {stat.mode}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 text-center">
                          {stat.plays}
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              stat.accuracy >= 85
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : stat.accuracy >= 75
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {stat.accuracy}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="w-full max-w-[120px] ml-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                              style={{ width: `${stat.accuracy}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Note about mock data */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Note: This page displays static mock data for demonstration
            purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
