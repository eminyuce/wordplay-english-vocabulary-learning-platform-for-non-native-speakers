import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllLanguages } from '../hooks/useQueries';
import LanguageGrid from '../components/LanguageGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: languages = [], isLoading, isError, error } = useGetAllLanguages();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    // Load username from localStorage
    const stored = localStorage.getItem('wordplay_username');
    if (stored) {
      setDisplayName(stored);
      setUsername(stored);
    } else {
      // Generate fallback username
      const fallback = `gamer-${Math.floor(Math.random() * 10000)}`;
      setDisplayName(fallback);
      localStorage.setItem('wordplay_username', fallback);
    }
  }, []);

  const handleSaveUsername = () => {
    const trimmed = username.trim();
    const finalName = trimmed || `gamer-${Math.floor(Math.random() * 10000)}`;
    setDisplayName(finalName);
    localStorage.setItem('wordplay_username', finalName);
  };

  // Sort languages by ordering field (ascending)
  const sortedLanguages = [...languages].sort((a, b) => {
    const orderA = Number(a.ordering);
    const orderB = Number(b.ordering);
    return orderA - orderB;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading languages...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load languages. Please refresh the page or contact support.
            <br />
            <span className="text-xs text-muted-foreground mt-2 block">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="glass-card rounded-2xl p-8 mb-8 text-center shadow-lg">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Welcome to WordPlay
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            A game-based platform to learn English vocabulary.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Players improve their English by progressing through multiple difficulty levels and learning new words through gameplay.
          </p>

          {/* Username Setup */}
          <div className="mt-6 max-w-md mx-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Hello, <span className="font-semibold">{displayName}</span>!
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter your gamer name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="glass-input"
              />
              <Button onClick={handleSaveUsername} className="glass-button">
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="glass-card rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Choose Your Learning Language
          </h2>
          {sortedLanguages.length === 0 ? (
            <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>No languages available yet!</strong>
                <br />
                An administrator needs to set up languages first. Please contact your administrator or visit the admin panel to create languages.
              </AlertDescription>
            </Alert>
          ) : (
            <LanguageGrid languages={sortedLanguages} />
          )}
        </div>
      </div>
    </div>
  );
}
