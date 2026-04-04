import { useState } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useGetAllLanguages, useSeedInitialLanguages } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Settings, List, LogOut, FileJson, Languages, Sparkles } from 'lucide-react';
import CreateLanguageModal from './CreateLanguageModal';
import AddWordModal from './AddWordModal';
import VocabImportModal from './VocabImportModal';
import AdminLoginForm from './AdminLoginForm';
import LanguageManagementModal from './LanguageManagementModal';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../ui/alert';

export default function AdminPanel() {
  const { isAdminAuthenticated, logout } = useAdminAuth();
  const { data: languages, isLoading: languagesLoading } = useGetAllLanguages();
  const seedLanguages = useSeedInitialLanguages();
  const [showCreateLanguage, setShowCreateLanguage] = useState(false);
  const [showAddWord, setShowAddWord] = useState(false);
  const [showImportVocab, setShowImportVocab] = useState(false);
  const [showLanguageManagement, setShowLanguageManagement] = useState(false);

  if (!isAdminAuthenticated) {
    return <AdminLoginForm />;
  }

  const handleManageWords = () => {
    window.location.href = '/admin';
  };

  const handleSeedLanguages = async () => {
    try {
      await seedLanguages.mutateAsync();
      toast.success('Initial languages seeded successfully! 6 languages have been created.');
    } catch (error: any) {
      console.error('Seed languages error:', error);
      toast.error(error.message || 'Failed to seed languages');
    }
  };

  const hasNoLanguages = !languagesLoading && (!languages || languages.length === 0);

  return (
    <>
      <Card className="mt-8 border-2 border-primary/20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Panel
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Manage target languages and English vocabulary content for the learning platform.
          </p>

          {hasNoLanguages && (
            <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>No languages found!</strong> Click "Seed Initial Languages" below to create 6 starter languages (Turkish, Spanish, Arabic, German, Japanese, French), or create languages manually.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <h4 className="font-semibold mb-2 text-sm">Quick Stats</h4>
            <p className="text-sm text-muted-foreground">
              Total Target Languages: <span className="font-bold text-foreground">{languages?.length || 0}</span>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Target Language Management</h4>
            <div className="flex flex-wrap gap-2">
              {hasNoLanguages && (
                <Button 
                  onClick={handleSeedLanguages} 
                  disabled={seedLanguages.isPending}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Sparkles className="w-4 h-4" />
                  {seedLanguages.isPending ? 'Seeding...' : 'Seed Initial Languages'}
                </Button>
              )}
              <Button onClick={() => setShowCreateLanguage(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Target Language
              </Button>
              <Button onClick={() => setShowLanguageManagement(true)} variant="outline" className="gap-2">
                <Languages className="w-4 h-4" />
                Manage Languages
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">English Vocabulary Management</h4>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setShowAddWord(true)} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add English Word
              </Button>
              <Button onClick={() => setShowImportVocab(true)} variant="outline" className="gap-2">
                <FileJson className="w-4 h-4" />
                Import from JSON
              </Button>
              <Button onClick={handleManageWords} variant="secondary" className="gap-2">
                <List className="w-4 h-4" />
                Manage All Words
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCreateLanguage && (
        <CreateLanguageModal 
          open={showCreateLanguage} 
          onClose={() => setShowCreateLanguage(false)} 
        />
      )}

      {showAddWord && (
        <AddWordModal 
          open={showAddWord} 
          onClose={() => setShowAddWord(false)} 
        />
      )}

      {showImportVocab && (
        <VocabImportModal
          open={showImportVocab}
          onClose={() => setShowImportVocab(false)}
        />
      )}

      {showLanguageManagement && (
        <LanguageManagementModal
          open={showLanguageManagement}
          onClose={() => setShowLanguageManagement(false)}
        />
      )}
    </>
  );
}
