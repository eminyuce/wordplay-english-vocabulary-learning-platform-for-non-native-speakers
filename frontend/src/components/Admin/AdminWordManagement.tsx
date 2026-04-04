import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Upload, FileJson, FileSpreadsheet, Trash2, Edit2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import AddWordModal from './AddWordModal';
import EditWordModal from './EditWordModal';
import VocabImportModal from './VocabImportModal';
import CsvImportModal from './CsvImportModal';
import AddLanguageModal from './AddLanguageModal';
import BulkLanguageImportModal from './BulkLanguageImportModal';
import LanguageManagementModal from './LanguageManagementModal';
import FeedbackManagement from './FeedbackManagement';
import MotivationalQuotesManagement from './MotivationalQuotesManagement';
import type { Word, Language, Difficulty, DifficultySelector } from '../../backend';

type DifficultyFilter = 'All' | 'Beginner' | 'Medium' | 'Hard' | 'Advanced';

// Helper function to convert DifficultyFilter to backend DifficultySelector enum
function convertDifficultyFilterToBackend(filter: DifficultyFilter): DifficultySelector {
  switch (filter) {
    case 'Beginner':
      return 'beginner' as DifficultySelector;
    case 'Medium':
      return 'medium' as DifficultySelector;
    case 'Hard':
      return 'hard' as DifficultySelector;
    case 'Advanced':
      return 'advanced' as DifficultySelector;
    case 'All':
    default:
      return 'all' as DifficultySelector;
  }
}

// Helper function to convert Difficulty enum to string
function difficultyToString(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'beginner':
      return 'Beginner';
    case 'medium':
      return 'Medium';
    case 'hard':
      return 'Hard';
    case 'advanced':
      return 'Advanced';
    default:
      return difficulty;
  }
}

export default function AdminWordManagement() {
  const { actor } = useActor();
  const { logout } = useAdminAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Turkish');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('Beginner');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState(false);
  const [isAddLanguageModalOpen, setIsAddLanguageModalOpen] = useState(false);
  const [isBulkLanguageImportModalOpen, setIsBulkLanguageImportModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [activeTab, setActiveTab] = useState('vocabulary');
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  
  // Vocabulary pagination state
  const [vocabPageSize, setVocabPageSize] = useState<number>(50);
  const [vocabCurrentPage, setVocabCurrentPage] = useState<number>(1);
  
  // Language pagination state
  const [languagePageSize, setLanguagePageSize] = useState<number>(50);
  const [languageCurrentPage, setLanguageCurrentPage] = useState<number>(1);

  const { data: languages = [], isLoading: languagesLoading, refetch: refetchLanguages } = useQuery<Language[]>({
    queryKey: ['languages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLanguagesSorted();
    },
    enabled: !!actor,
  });

  // Fetch words using backend function with difficulty filter
  const { data: allFilteredWords = [], isLoading: wordsLoading, refetch: refetchWords } = useQuery<Word[]>({
    queryKey: ['vocabulary', selectedLanguage, difficultyFilter],
    queryFn: async () => {
      if (!actor) return [];
      const difficultySelector = convertDifficultyFilterToBackend(difficultyFilter);
      return actor.getWordsByDifficulty(selectedLanguage, difficultySelector);
    },
    enabled: !!actor,
  });

  // Apply search filter on frontend
  const filteredWords = React.useMemo(() => {
    if (!searchQuery) return allFilteredWords;
    const query = searchQuery.toLowerCase();
    return allFilteredWords.filter(
      (word) =>
        word.english.toLowerCase().includes(query) ||
        word.foreign.toLowerCase().includes(query)
    );
  }, [allFilteredWords, searchQuery]);

  // Paginate filtered words
  const paginatedWords = React.useMemo(() => {
    const startIndex = (vocabCurrentPage - 1) * vocabPageSize;
    const endIndex = startIndex + vocabPageSize;
    return filteredWords.slice(startIndex, endIndex);
  }, [filteredWords, vocabCurrentPage, vocabPageSize]);

  const totalVocabCount = filteredWords.length;
  const totalVocabPages = Math.ceil(totalVocabCount / vocabPageSize);

  // Sort languages alphabetically by name and paginate
  const sortedLanguages = React.useMemo(() => {
    return [...languages].sort((a, b) => a.name.localeCompare(b.name));
  }, [languages]);

  const paginatedLanguages = React.useMemo(() => {
    const startIndex = (languageCurrentPage - 1) * languagePageSize;
    const endIndex = startIndex + languagePageSize;
    return sortedLanguages.slice(startIndex, endIndex);
  }, [sortedLanguages, languageCurrentPage, languagePageSize]);

  const totalLanguagePages = Math.ceil(sortedLanguages.length / languagePageSize);

  const handleDeleteWord = async (id: bigint) => {
    if (!actor) return;

    try {
      await actor.deleteWord(id);
      toast.success('Word deleted successfully');
      refetchWords();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete word');
    }
  };

  const handleEditWord = (word: Word) => {
    setEditingWord(word);
    setIsEditModalOpen(true);
  };

  const handleRemoveAllWords = async () => {
    if (!actor) return;
    if (
      !confirm(
        `Are you sure you want to remove all words for ${selectedLanguage}? This action cannot be undone.`
      )
    )
      return;

    try {
      await actor.removeWordsByLanguage(selectedLanguage);
      toast.success(`All words for ${selectedLanguage} removed successfully`);
      refetchWords();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove words');
    }
  };

  const handleEditLanguage = (language: Language) => {
    setEditingLanguage(language);
    setIsLanguageModalOpen(true);
  };

  const handleDeleteLanguage = async (languageName: string) => {
    if (!actor) return;

    try {
      await actor.removeLanguage(languageName);
      toast.success(`Language "${languageName}" removed successfully`);
      refetchLanguages();
      // Reset to first page if current page becomes invalid
      if (languageCurrentPage > Math.ceil((sortedLanguages.length - 1) / languagePageSize)) {
        setLanguageCurrentPage(1);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove language');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/admin/login';
  };

  const handleVocabPageSizeChange = (newSize: string) => {
    setVocabPageSize(Number(newSize));
    setVocabCurrentPage(1); // Reset to first page when changing page size
  };

  const handleVocabPreviousPage = () => {
    setVocabCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleVocabNextPage = () => {
    setVocabCurrentPage((prev) => Math.min(totalVocabPages, prev + 1));
  };

  const handleLanguagePageSizeChange = (newSize: string) => {
    setLanguagePageSize(Number(newSize));
    setLanguageCurrentPage(1); // Reset to first page when changing page size
  };

  const handleLanguagePreviousPage = () => {
    setLanguageCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleLanguageNextPage = () => {
    setLanguageCurrentPage((prev) => Math.min(totalLanguagePages, prev + 1));
  };

  // Export handlers - Export ALL words of the selected language using backend functions
  const handleExportJSON = async () => {
    if (!actor) {
      toast.error('Actor not available');
      return;
    }

    try {
      // Use backend exportWordsJSON function to get all words for selected language
      const allWords = await actor.exportWordsJSON(selectedLanguage);

      if (allWords.length === 0) {
        toast.error('No words found for this language');
        return;
      }

      // Convert Word objects to export format
      const exportData = allWords.map(word => ({
        id: word.id.toString(),
        english: word.english,
        foreign: word.foreign,
        languageName: word.languageName,
        difficulty: word.difficulty,
        examples: word.examples,
        addedAt: word.addedAt.toString(),
      }));

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vocabulary_${selectedLanguage}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${allWords.length} words as JSON`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to export words as JSON');
    }
  };

  const handleExportCSV = async () => {
    if (!actor) {
      toast.error('Actor not available');
      return;
    }

    try {
      // Use backend exportWordsCSV function to get all words for selected language
      const csvRows = await actor.exportWordsCSV(selectedLanguage);

      if (csvRows.length === 0) {
        toast.error('No words found for this language');
        return;
      }

      // CSV header
      const headers = ['English', 'Translation', 'Language', 'Difficulty', 'Examples', 'Added At'];
      
      // Format CSV rows (backend returns tuples)
      const formattedRows = csvRows.map(row => {
        const [english, foreign, languageName, difficulty, examples, addedAt] = row;
        return [
          `"${english.replace(/"/g, '""')}"`,
          `"${foreign.replace(/"/g, '""')}"`,
          languageName,
          difficulty,
          `"${examples.replace(/"/g, '""')}"`,
          addedAt,
        ];
      });

      const csvContent = [
        headers.join(','),
        ...formattedRows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vocabulary_${selectedLanguage}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${csvRows.length} words as CSV`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to export words as CSV');
    }
  };

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setVocabCurrentPage(1);
  }, [selectedLanguage, difficultyFilter, searchQuery]);

  // Generate page numbers for display
  const getVocabPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 7;
    
    if (totalVocabPages <= maxVisible) {
      for (let i = 1; i <= totalVocabPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page and 3 pages before and after
      const start = Math.max(1, vocabCurrentPage - 3);
      const end = Math.min(totalVocabPages, vocabCurrentPage + 3);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (languagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage vocabulary, languages, quotes, and feedback
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="glass-button"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card p-1 grid w-full grid-cols-4 gap-1">
            <TabsTrigger 
              value="vocabulary" 
              className={activeTab === 'vocabulary' ? 'admin-tab-active' : 'glass-tab'}
            >
              Vocabulary
            </TabsTrigger>
            <TabsTrigger 
              value="languages" 
              className={activeTab === 'languages' ? 'admin-tab-active' : 'glass-tab'}
            >
              Languages
            </TabsTrigger>
            <TabsTrigger 
              value="quotes" 
              className={activeTab === 'quotes' ? 'admin-tab-active' : 'glass-tab'}
            >
              Quotes
            </TabsTrigger>
            <TabsTrigger 
              value="feedback" 
              className={activeTab === 'feedback' ? 'admin-tab-active' : 'glass-tab'}
            >
              Feedback
            </TabsTrigger>
          </TabsList>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="space-y-6">
            {/* Controls */}
            <div className="glass-card rounded-2xl p-6 shadow-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Target Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="admin-language-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-modal">
                      {languages.map((lang) => (
                        <SelectItem key={lang.name} value={lang.name}>
                          {lang.flagEmoji} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Search</Label>
                  <Input
                    placeholder="Search words..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass-input"
                  />
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Difficulty Filter</Label>
                <div className="flex flex-wrap gap-2">
                  {(['All', 'Beginner', 'Medium', 'Hard', 'Advanced'] as DifficultyFilter[]).map(
                    (diff) => (
                      <Button
                        key={diff}
                        onClick={() => setDifficultyFilter(diff)}
                        variant={difficultyFilter === diff ? 'default' : 'outline'}
                        className={
                          difficultyFilter === diff
                            ? 'bg-sky-200 text-gray-900 hover:bg-sky-300 dark:bg-sky-300 dark:text-gray-900 dark:hover:bg-sky-400'
                            : 'admin-gray-button'
                        }
                      >
                        {diff}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="glass-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Word
                </Button>
                <Button
                  onClick={() => setIsImportModalOpen(true)}
                  className="glass-button"
                >
                  <FileJson className="w-4 h-4 mr-2" />
                  Import JSON
                </Button>
                <Button
                  onClick={() => setIsCsvImportModalOpen(true)}
                  className="glass-button"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
                <Button
                  onClick={handleRemoveAllWords}
                  variant="destructive"
                  className="glass-button-danger"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove All Words
                </Button>
              </div>
            </div>

            {/* Words Table */}
            <div className="glass-card rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold">
                  Words ({totalVocabCount})
                </h2>
                <div className="flex items-center gap-2">
                  {/* Page Size Selector */}
                  <Label className="text-sm font-medium">Page Size:</Label>
                  <Select value={String(vocabPageSize)} onValueChange={handleVocabPageSizeChange}>
                    <SelectTrigger className="w-24 glass-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-modal">
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="250">250</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Export Buttons - Exports ALL words of selected language */}
              <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleExportJSON}
                  className="glass-button"
                  disabled={!actor}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as JSON
                </Button>
                <Button
                  onClick={handleExportCSV}
                  className="glass-button"
                  disabled={!actor}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as CSV
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 self-center ml-2">
                  Exports all words for {selectedLanguage}
                </p>
              </div>

              {wordsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : paginatedWords.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No words found. Add some words to get started.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full glass-data-table">
                      <thead>
                        <tr>
                          <th>English</th>
                          <th>Translation</th>
                          <th>Difficulty</th>
                          <th>Examples</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedWords.map((word, index) => (
                          <tr 
                            key={word.id.toString()}
                            className={`glass-table-row ${index % 2 === 0 ? 'glass-table-row-even' : 'glass-table-row-odd'}`}
                          >
                            <td>{word.english}</td>
                            <td>{word.foreign}</td>
                            <td>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {difficultyToString(word.difficulty)}
                              </span>
                            </td>
                            <td>{word.examples.length}</td>
                            <td>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEditWord(word)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                  title="Edit Word"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                      title="Delete Word"
                                    >
                                      <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="glass-modal">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="glass-text">
                                        Delete Word?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="glass-text-muted">
                                        Are you sure you want to delete "{word.english}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="glass-button-outline">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteWord(word.id)}
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

                  {/* Pagination Controls */}
                  {totalVocabPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {(vocabCurrentPage - 1) * vocabPageSize + 1} to{' '}
                        {Math.min(vocabCurrentPage * vocabPageSize, totalVocabCount)} of{' '}
                        {totalVocabCount} words
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Previous Page Button */}
                        <Button
                          onClick={handleVocabPreviousPage}
                          disabled={vocabCurrentPage === 1}
                          size="sm"
                          variant="outline"
                          className="glass-button-outline"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Previous</span>
                        </Button>
                        
                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                          {getVocabPageNumbers().map((pageNum) => (
                            <Button
                              key={pageNum}
                              onClick={() => setVocabCurrentPage(pageNum)}
                              size="sm"
                              variant={vocabCurrentPage === pageNum ? 'default' : 'outline'}
                              className={
                                vocabCurrentPage === pageNum
                                  ? 'w-8 h-8 p-0 bg-sky-200 text-gray-900 hover:bg-sky-300 dark:bg-sky-300 dark:text-gray-900'
                                  : 'w-8 h-8 p-0 glass-button-outline'
                              }
                            >
                              {pageNum}
                            </Button>
                          ))}
                        </div>
                        
                        {/* Next Page Button */}
                        <Button
                          onClick={handleVocabNextPage}
                          disabled={vocabCurrentPage === totalVocabPages}
                          size="sm"
                          variant="outline"
                          className="glass-button-outline"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* Languages Tab */}
          <TabsContent value="languages">
            <div className="glass-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Language Management</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsAddLanguageModalOpen(true)}
                    className="glass-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Language
                  </Button>
                  <Button
                    onClick={() => setIsBulkLanguageImportModalOpen(true)}
                    className="glass-button"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Import CSV
                  </Button>
                  <Button
                    onClick={() => setIsLanguageModalOpen(true)}
                    className="glass-button"
                  >
                    Manage Languages
                  </Button>
                </div>
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-2 mb-4">
                <Label className="text-sm font-medium">Page Size:</Label>
                <Select value={String(languagePageSize)} onValueChange={handleLanguagePageSizeChange}>
                  <SelectTrigger className="w-24 glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-modal">
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="250">250</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full glass-data-table">
                  <thead>
                    <tr>
                      <th>Flag</th>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Direction</th>
                      <th>Ordering</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLanguages.map((lang, index) => (
                      <tr 
                        key={lang.name}
                        className={`glass-table-row ${index % 2 === 0 ? 'glass-table-row-even' : 'glass-table-row-odd'}`}
                      >
                        <td className="text-2xl">{lang.flagEmoji}</td>
                        <td>{lang.name}</td>
                        <td>{lang.code}</td>
                        <td className="uppercase">{lang.textDirection}</td>
                        <td>{lang.ordering.toString()}</td>
                        <td>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditLanguage(lang)}
                              size="sm"
                              variant="ghost"
                              className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              title="Edit Language"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                  title="Delete Language"
                                >
                                  <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-modal">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="glass-text">
                                    Remove {lang.name}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="glass-text-muted">
                                    This will permanently delete the language "{lang.name}" and all associated words. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="glass-button-outline">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteLanguage(lang.name)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove Language
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

              {/* Pagination Controls */}
              {totalLanguagePages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(languageCurrentPage - 1) * languagePageSize + 1} to{' '}
                    {Math.min(languageCurrentPage * languagePageSize, sortedLanguages.length)} of{' '}
                    {sortedLanguages.length} languages
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleLanguagePreviousPage}
                      disabled={languageCurrentPage === 1}
                      size="sm"
                      variant="outline"
                      className="glass-button-outline"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Page {languageCurrentPage} of {totalLanguagePages}
                    </span>
                    <Button
                      onClick={handleLanguageNextPage}
                      disabled={languageCurrentPage === totalLanguagePages}
                      size="sm"
                      variant="outline"
                      className="glass-button-outline"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes">
            <MotivationalQuotesManagement />
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <FeedbackManagement />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <AddWordModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />

        {editingWord && (
          <EditWordModal
            open={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingWord(null);
            }}
            word={editingWord}
          />
        )}

        <VocabImportModal
          open={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
        />

        <CsvImportModal
          open={isCsvImportModalOpen}
          onClose={() => setIsCsvImportModalOpen(false)}
        />

        <AddLanguageModal
          open={isAddLanguageModalOpen}
          onClose={() => setIsAddLanguageModalOpen(false)}
        />

        <BulkLanguageImportModal
          open={isBulkLanguageImportModalOpen}
          onClose={() => setIsBulkLanguageImportModalOpen(false)}
        />

        <LanguageManagementModal
          open={isLanguageModalOpen}
          onClose={() => {
            setIsLanguageModalOpen(false);
            setEditingLanguage(null);
          }}
          initialEditLanguage={editingLanguage}
        />
      </div>
    </div>
  );
}
