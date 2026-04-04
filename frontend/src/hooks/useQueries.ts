import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  Language,
  Word,
  UserProfile,
  Feedback,
  FeedbackCategory,
  Difficulty,
  DifficultySelector,
  TextDirection,
  MotivationalQuote,
  UserProgress,
  GlobalAnalytics,
} from '../backend';

// ============================================================================
// LANGUAGE QUERIES
// ============================================================================

export function useGetAllLanguages() {
  const { actor, isFetching } = useActor();

  return useQuery<Language[]>({
    queryKey: ['languages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLanguages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLanguagesSorted() {
  const { actor, isFetching } = useActor();

  return useQuery<Language[]>({
    queryKey: ['languages', 'sorted'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLanguagesSorted();
    },
    enabled: !!actor && !isFetching,
  });
}

// ============================================================================
// WORD QUERIES
// ============================================================================

export function useGetWordsForLanguagePage(
  language: string,
  offset: number,
  limit: number
) {
  const { actor, isFetching } = useActor();

  return useQuery<Word[]>({
    queryKey: ['words', 'language', language, 'page', offset, limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWordsForLanguagePage(
        language,
        BigInt(offset),
        BigInt(limit)
      );
    },
    enabled: !!actor && !isFetching && !!language,
  });
}

export function useGetWordsCountForLanguage(language: string) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['words', 'count', language],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getWordsCountForLanguage(language);
    },
    enabled: !!actor && !isFetching && !!language,
  });
}

export function useGetWordsByDifficulty(
  language: string,
  difficulty: DifficultySelector
) {
  const { actor, isFetching } = useActor();

  return useQuery<Word[]>({
    queryKey: ['words', 'language', language, 'difficulty', difficulty],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWordsByDifficulty(language, difficulty);
    },
    enabled: !!actor && !isFetching && !!language,
  });
}

export function useGetAllWords() {
  const { actor, isFetching } = useActor();

  return useQuery<Word[]>({
    queryKey: ['words', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWords();
    },
    enabled: !!actor && !isFetching,
  });
}

// ============================================================================
// USER PROFILE QUERIES
// ============================================================================

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ============================================================================
// ADMIN LANGUAGE MUTATIONS
// ============================================================================

export function useCreateLanguage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      code: string;
      flag: string;
      direction: TextDirection;
      startColor: string;
      endColor: string;
      ordering: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLanguage(
        params.name,
        params.code,
        params.flag,
        params.direction,
        params.startColor,
        params.endColor,
        params.ordering
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
  });
}

export function useRemoveLanguage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (language: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeLanguage(language);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      queryClient.invalidateQueries({ queryKey: ['words'] });
    },
  });
}

export function useUpdateLanguageOrdering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { languageName: string; newOrdering: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLanguageOrdering(params.languageName, params.newOrdering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
  });
}

export function useUpdateLanguage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      languageName: string;
      newName: string;
      newCode: string;
      newFlag: string;
      newDirection: TextDirection;
      newGradientStart: string;
      newGradientEnd: string;
      newOrdering: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLanguage(
        params.languageName,
        params.newName,
        params.newCode,
        params.newFlag,
        params.newDirection,
        params.newGradientStart,
        params.newGradientEnd,
        params.newOrdering
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
  });
}

export function useSeedInitialLanguages() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.seedInitialLanguages();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
  });
}

export function useBulkImportLanguages() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      languageRows: [string, string, string, TextDirection, string, string, bigint][]
    ) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkImportLanguages(languageRows);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
  });
}

// ============================================================================
// ADMIN WORD MUTATIONS
// ============================================================================

export function useAddWord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      english: string;
      foreign: string;
      language: string;
      difficulty: Difficulty;
      examples: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addWord(
        params.english,
        params.foreign,
        params.language,
        params.difficulty,
        params.examples
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words'] });
    },
  });
}

export function useUpdateWord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      english: string;
      foreign: string;
      language: string;
      difficulty: Difficulty;
      examples: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateWord(
        params.id,
        params.english,
        params.foreign,
        params.language,
        params.difficulty,
        params.examples
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words'] });
    },
  });
}

export function useDeleteWord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteWord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words'] });
    },
  });
}

export function useBulkImportWords() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (words: Word[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkImportWords(words);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words'] });
    },
  });
}

export function useRemoveWordsByLanguage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (language: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeWordsByLanguage(language);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words'] });
    },
  });
}

// ============================================================================
// MOTIVATIONAL QUOTES QUERIES AND MUTATIONS
// ============================================================================

export function useGetAllQuotes() {
  const { actor, isFetching } = useActor();

  return useQuery<MotivationalQuote[]>({
    queryKey: ['quotes', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuotes();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias for backward compatibility
export function useGetAllMotivationalQuotes() {
  return useGetAllQuotes();
}

export function useGetAllQuotesPublic() {
  const { actor, isFetching } = useActor();

  return useQuery<MotivationalQuote[]>({
    queryKey: ['quotes', 'public'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuotesPublic();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRandomMotivationalQuote() {
  const { actor, isFetching } = useActor();

  return useQuery<MotivationalQuote | null>({
    queryKey: ['quotes', 'random', Date.now()],
    queryFn: async () => {
      if (!actor) return null;
      const quotes = await actor.getAllQuotesPublic();
      if (quotes.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * quotes.length);
      return quotes[randomIndex];
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useCreateQuote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createQuote(text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

// Alias for backward compatibility
export function useAddMotivationalQuote() {
  return useCreateQuote();
}

// Bulk add quotes mutation (creates multiple quotes)
export function useBulkAddMotivationalQuotes() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotes: string[]) => {
      if (!actor) throw new Error('Actor not available');
      // Create each quote individually
      const promises = quotes.map(text => actor.createQuote(text));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useUpdateQuote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateQuote(params.id, params.text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

// Alias for backward compatibility
export function useUpdateMotivationalQuote() {
  return useUpdateQuote();
}

export function useDeleteQuote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteQuote(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

// Alias for backward compatibility
export function useDeleteMotivationalQuote() {
  return useDeleteQuote();
}

// ============================================================================
// FEEDBACK QUERIES AND MUTATIONS
// ============================================================================

export function useGetAllFeedback() {
  const { actor, isFetching } = useActor();

  return useQuery<Feedback[]>({
    queryKey: ['feedback', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFeedback();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (params: {
      authorName: string | null;
      category: FeedbackCategory;
      title: string;
      message: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      const authorPrincipal = identity ? identity.getPrincipal() : null;
      
      return actor.submitFeedback(
        authorPrincipal,
        params.authorName,
        params.category,
        params.title,
        params.message
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}

export function useMarkFeedbackCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markFeedbackCompleted(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}

export function useDeleteFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteFeedback(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}

// ============================================================================
// ADMIN AUTH
// ============================================================================

export function useAdminLogin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminLogin(params.username, params.password);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['admin', 'isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ============================================================================
// ANALYTICS QUERIES AND MUTATIONS
// ============================================================================

export function useRecordGameRound() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      correctAnswers: number;
      totalQuestions: number;
      gameMode: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      return actor.recordGameRound(
        BigInt(params.correctAnswers),
        BigInt(params.totalQuestions),
        params.gameMode
      );
    },
    onSuccess: () => {
      // Invalidate analytics queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
  });
}

export function useGetGlobalAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<GlobalAnalytics>({
    queryKey: ['analytics', 'global'],
    queryFn: async () => {
      if (!actor) {
        return {
          totalUsers: BigInt(0),
          totalSessions: BigInt(0),
          totalQuestionsAnswered: BigInt(0),
          averageAccuracy: 0,
        };
      }
      return actor.getGlobalAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserAnalytics() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserProgress | null>({
    queryKey: ['analytics', 'user', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getUserAnalytics(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Combined analytics data hook for the Analytics page
export function useGetAnalyticsData() {
  const globalAnalytics = useGetGlobalAnalytics();
  const userAnalytics = useGetUserAnalytics();
  const { identity } = useInternetIdentity();

  const isLoading = globalAnalytics.isLoading || (identity ? userAnalytics.isLoading : false);
  const error = globalAnalytics.error || userAnalytics.error;

  // Transform backend data to match frontend expectations
  const data = React.useMemo(() => {
    if (!globalAnalytics.data) return null;

    const global = globalAnalytics.data;
    const personal = userAnalytics.data;

    return {
      personal: personal ? {
        totalGames: Number(personal.totalGames),
        accuracy: personal.accuracy * 100, // Convert to percentage
        streak: Number(personal.streak),
        xp: Number(personal.xp),
        mostPlayedGameMode: personal.mostPlayedGameMode,
        totalCorrect: Number(personal.totalCorrect),
        totalAnswered: Number(personal.totalAnswered),
      } : {
        totalGames: 0,
        accuracy: 0,
        streak: 0,
        xp: 0,
        mostPlayedGameMode: 'N/A',
        totalCorrect: 0,
        totalAnswered: 0,
      },
      global: {
        totalUsers: Number(global.totalUsers),
        totalSessions: Number(global.totalSessions),
        totalQuestionsAnswered: Number(global.totalQuestionsAnswered),
        averageAccuracy: global.averageAccuracy * 100, // Convert to percentage
      },
      gameMode: {
        gameModePlays: [] as [string, number][],
        averageScores: [] as [string, number][],
        averageAccuracy: [] as [string, number][],
      },
      language: {
        wordsAttempted: [] as [string, number][],
        gamesPlayed: [] as [string, number][],
      },
    };
  }, [globalAnalytics.data, userAnalytics.data]);

  return {
    data,
    isLoading,
    error,
  };
}

// Placeholder hooks for backward compatibility (no longer needed but kept for safety)
type UserPreferences = {
  difficulty: DifficultySelector;
  lastSelectedLanguage?: string;
};

export function useGetCallerUserPreferences() {
  return useQuery<UserPreferences | null>({
    queryKey: ['userPreferences'],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useUpdateCallerUserPreferences() {
  return useMutation<void, Error, UserPreferences>({
    mutationFn: async () => {
      return Promise.resolve();
    },
  });
}

