import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetWordsForLanguagePage, useGetWordsCountForLanguage, useGetAllLanguages, useGetWordsByDifficulty } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Gamepad2, Zap, BookOpen, Brain, Grid3x3, Timer, Keyboard, Wrench, HelpCircle, Eye, AlertCircle } from 'lucide-react';
import { Difficulty, DifficultySelector } from '../backend';
import { toast } from 'sonner';
import MeaningMatchGame from '../components/Game/MeaningMatchGame';
import ReverseMeaningGame from '../components/Game/ReverseMeaningGame';
import GapFillGame from '../components/Game/GapFillGame';
import FlashcardsGame from '../components/Game/FlashcardsGame';
import MemoryMatchGame from '../components/Game/MemoryMatchGame';
import SpeedChallengeGame from '../components/Game/SpeedChallengeGame';
import ShadowWordGame from '../components/Game/ShadowWordGame';
import WordGridGame from '../components/Game/WordGridGame';
import TypeItFastGame from '../components/Game/TypeItFastGame';
import FixTheWordGame from '../components/Game/FixTheWordGame';
import MissingLettersGame from '../components/Game/MissingLettersGame';
import FindingVerbsGame from '../components/Game/FindingVerbsGame';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type GameMode = 'meaning-match' | 'reverse-meaning' | 'gap-fill' | 'flashcards' | 'memory-match' | 'speed-challenge' | 'shadow-word' | 'word-grid' | 'type-it-fast' | 'fix-the-word' | 'missing-letters' | 'finding-verbs' | null;

export default function LanguagePage() {
  const { language: languageName } = useParams({ from: '/language/$language' });
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultySelector>(DifficultySelector.all);
  const [activeGame, setActiveGame] = useState<GameMode>(null);
  
  // Pagination state
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: languages, isLoading: languagesLoading } = useGetAllLanguages();
  const currentLanguage = languages?.find((l) => l.name === languageName);

  const { data: totalCount } = useGetWordsCountForLanguage(languageName);
  
  // Fetch words by difficulty selector
  const { data: fetchedWords, isLoading, isError, error } = useGetWordsByDifficulty(
    languageName,
    selectedDifficulty
  );

  // Apply search filter
  const filteredWords = fetchedWords?.filter((word) => {
    const matchesSearch =
      word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.foreign.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Paginate filtered words
  const totalPages = Math.ceil((filteredWords?.length || 0) / pageSize);
  const displayWords = filteredWords?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const difficultyOptions: Array<{ value: DifficultySelector; label: string }> = [
    { value: DifficultySelector.all, label: 'All' },
    { value: DifficultySelector.beginner, label: 'Beginner' },
    { value: DifficultySelector.medium, label: 'Medium' },
    { value: DifficultySelector.hard, label: 'Hard' },
    { value: DifficultySelector.advanced, label: 'Advanced' },
  ];

  // Reordered game modes according to user specification
  const gameModesData = [
    {
      id: 'flashcards' as GameMode,
      title: 'Flashcards',
      description: 'Study vocabulary with interactive cards',
      icon: Brain,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-100',
    },
    {
      id: 'meaning-match' as GameMode,
      title: 'Meaning Match',
      description: 'Match English words with their translations',
      icon: Gamepad2,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-100',
    },
    {
      id: 'memory-match' as GameMode,
      title: 'Memory Match',
      description: 'Match pairs of words and translations',
      icon: Grid3x3,
      gradient: 'from-cyan-500 to-blue-600',
      bgGradient: 'from-cyan-50 to-blue-100',
    },
    {
      id: 'missing-letters' as GameMode,
      title: 'Missing Letters',
      description: 'Fill in the blanks to complete words',
      icon: HelpCircle,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-100',
    },
    {
      id: 'fix-the-word' as GameMode,
      title: 'Fix The Word',
      description: 'Correct the misspelled words',
      icon: Wrench,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-100',
    },
    {
      id: 'gap-fill' as GameMode,
      title: 'Gap Fill',
      description: 'Complete sentences with the right word',
      icon: BookOpen,
      gradient: 'from-green-500 to-teal-600',
      bgGradient: 'from-green-50 to-teal-100',
    },
    {
      id: 'type-it-fast' as GameMode,
      title: 'Type It Fast',
      description: 'Speed typing challenge with time pressure',
      icon: Keyboard,
      gradient: 'from-fuchsia-500 to-pink-600',
      bgGradient: 'from-fuchsia-50 to-pink-100',
    },
    {
      id: 'speed-challenge' as GameMode,
      title: 'Speed Challenge',
      description: '30-second rapid-fire vocabulary test',
      icon: Timer,
      gradient: 'from-rose-500 to-pink-600',
      bgGradient: 'from-rose-50 to-pink-100',
    },
    {
      id: 'shadow-word' as GameMode,
      title: 'Shadow Word',
      description: 'Remember words shown briefly',
      icon: Eye,
      gradient: 'from-slate-500 to-gray-600',
      bgGradient: 'from-slate-50 to-gray-100',
    },
    {
      id: 'reverse-meaning' as GameMode,
      title: 'Reverse Meaning',
      description: 'Find the English word for translations',
      icon: Zap,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-100',
    },
    {
      id: 'finding-verbs' as GameMode,
      title: 'Finding Verbs',
      description: 'Identify verbs in example sentences',
      icon: BookOpen,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-100',
    },
    {
      id: 'word-grid' as GameMode,
      title: 'Word Grid',
      description: 'Select words matching the category',
      icon: Grid3x3,
      gradient: 'from-sky-500 to-blue-600',
      bgGradient: 'from-sky-50 to-blue-100',
    },
  ];

  const handleGameStart = (gameId: GameMode) => {
    if (!fetchedWords || fetchedWords.length === 0) {
      toast.error('No vocabulary available for this language yet. Please add words in the admin panel.');
      return;
    }
    setActiveGame(gameId);
  };

  const handleGameClose = () => {
    setActiveGame(null);
  };

  const handleDifficultyChange = (difficulty: DifficultySelector) => {
    setSelectedDifficulty(difficulty);
    setCurrentPage(1); // Reset to first page when changing difficulty
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedDifficulty, searchQuery]);

  // Render active game
  if (activeGame && currentLanguage && fetchedWords) {
    const gameProps = {
      words: fetchedWords,
      language: currentLanguage,
      languageName,
      onClose: handleGameClose,
    };

    switch (activeGame) {
      case 'meaning-match':
        return <MeaningMatchGame {...gameProps} />;
      case 'reverse-meaning':
        return <ReverseMeaningGame {...gameProps} />;
      case 'gap-fill':
        return <GapFillGame {...gameProps} />;
      case 'flashcards':
        return <FlashcardsGame {...gameProps} />;
      case 'memory-match':
        return <MemoryMatchGame {...gameProps} />;
      case 'speed-challenge':
        return <SpeedChallengeGame {...gameProps} />;
      case 'shadow-word':
        return <ShadowWordGame {...gameProps} />;
      case 'word-grid':
        return <WordGridGame {...gameProps} />;
      case 'type-it-fast':
        return <TypeItFastGame {...gameProps} />;
      case 'fix-the-word':
        return <FixTheWordGame {...gameProps} />;
      case 'missing-letters':
        return <MissingLettersGame {...gameProps} />;
      case 'finding-verbs':
        return <FindingVerbsGame {...gameProps} />;
      default:
        return null;
    }
  }

  if (languagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading language data...</p>
        </div>
      </div>
    );
  }

  if (!currentLanguage) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Language "{languageName}" not found. Please return to the home page and select a valid language.
            <br />
            <Button 
              onClick={() => navigate({ to: '/' })} 
              className="mt-4"
              size="sm"
            >
              Return to Home
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/' })}
              className="hover:bg-purple-100 dark:hover:bg-purple-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                {currentLanguage?.flagEmoji} Learn English Vocabulary
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Using {languageName} translations
              </p>
            </div>
          </div>
        </div>

        {/* Game Mode Selection Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Choose Your Game Mode
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Select a game to start learning English vocabulary
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {gameModesData.map((game) => {
              const Icon = game.icon;
              return (
                <button
                  key={game.id}
                  onClick={() => handleGameStart(game.id)}
                  className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-700"
                >
                  {/* Glass Card Container */}
                  <div className="glass-card p-6 h-full min-h-[180px] flex flex-col">
                    {/* Gradient Background Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${game.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Icon with Gradient */}
                      <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${game.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {game.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors flex-grow">
                        {game.description}
                      </p>

                      {/* Play Indicator */}
                      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                        <span>Play Now</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vocabulary Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Vocabulary Library
          </h2>
        </div>

        {/* Search, Filters, and Page Size */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">Page Size:</Label>
              <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex flex-wrap gap-2">
            {difficultyOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedDifficulty === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDifficultyChange(option.value)}
                className={
                  selectedDifficulty === option.value
                    ? 'bg-sky-200 text-gray-900 hover:bg-sky-300 dark:bg-sky-300 dark:text-gray-900 dark:hover:bg-sky-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load vocabulary words. Please try again.
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Error: {error instanceof Error ? error.message : 'Unknown error'}
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Words List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : displayWords && displayWords.length > 0 ? (
          <div className="space-y-4">
            {displayWords.map((word) => (
              <Card key={word.id.toString()} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{word.english}</CardTitle>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {word.foreign}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        word.difficulty === Difficulty.beginner
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : word.difficulty === Difficulty.medium
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : word.difficulty === Difficulty.hard
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }
                    >
                      {word.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                {word.examples && word.examples.length > 0 && (
                  <CardContent>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Examples:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {word.examples.map((example, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 dark:text-gray-400"
                        >
                          {example}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              {fetchedWords && fetchedWords.length === 0 ? (
                <>
                  <strong>No vocabulary words found for {languageName}!</strong>
                  <br />
                  An administrator needs to add English vocabulary words for this language. Please contact your administrator or visit the admin panel to add words.
                </>
              ) : (
                'No words found matching your search criteria.'
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Pagination Controls */}
        {filteredWords && filteredWords.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredWords.length)} of{' '}
              {filteredWords.length} words
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                size="sm"
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum: number;
                  
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      size="sm"
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                size="sm"
                variant="outline"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
