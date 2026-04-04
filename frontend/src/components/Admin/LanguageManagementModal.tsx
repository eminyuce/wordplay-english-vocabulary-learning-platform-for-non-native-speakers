import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useGetAllLanguages, useRemoveLanguage, useUpdateLanguage } from '../../hooks/useQueries';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Trash2, Edit2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import type { Language, TextDirection } from '../../backend';

interface LanguageManagementModalProps {
  open: boolean;
  onClose: () => void;
  initialEditLanguage?: Language | null;
}

interface EditingLanguage {
  originalName: string;
  name: string;
  code: string;
  flagEmoji: string;
  textDirection: TextDirection;
  gradientStart: string;
  gradientEnd: string;
  ordering: string;
}

export default function LanguageManagementModal({ open, onClose, initialEditLanguage }: LanguageManagementModalProps) {
  const { data: languages, isLoading, refetch } = useGetAllLanguages();
  const { mutate: removeLanguage, isPending: isRemoving } = useRemoveLanguage();
  const { mutate: updateLanguage, isPending: isUpdating } = useUpdateLanguage();
  const { isAdminAuthenticated } = useAdminAuth();
  const [editingLanguage, setEditingLanguage] = useState<EditingLanguage | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Auto-open edit mode if initialEditLanguage is provided
  useEffect(() => {
    if (initialEditLanguage && open) {
      handleStartEdit(initialEditLanguage);
    }
  }, [initialEditLanguage, open]);

  const handleRemoveLanguage = async (languageName: string) => {
    if (!isAdminAuthenticated) {
      setValidationErrors({ general: 'You must be logged in as admin to remove languages. Please log in via the Admin Login page.' });
      return;
    }

    removeLanguage(languageName, {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        setValidationErrors({ general: error.message });
      },
    });
  };

  const handleStartEdit = (language: Language) => {
    setEditingLanguage({
      originalName: language.name,
      name: language.name,
      code: language.code,
      flagEmoji: language.flagEmoji,
      textDirection: language.textDirection,
      gradientStart: language.gradientStart,
      gradientEnd: language.gradientEnd,
      ordering: String(language.ordering),
    });
    setValidationErrors({});
    setSaveSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingLanguage(null);
    setValidationErrors({});
  };

  const validateLanguageEdit = (editing: EditingLanguage): boolean => {
    const errors: Record<string, string> = {};

    // Validate name
    if (!editing.name.trim()) {
      errors.name = 'Language name is required';
    } else if (editing.name !== editing.originalName && languages?.some(l => l.name === editing.name)) {
      errors.name = 'Language name already exists';
    }

    // Validate code
    if (!editing.code.trim()) {
      errors.code = 'Language code is required';
    }

    // Validate flag emoji
    if (!editing.flagEmoji.trim()) {
      errors.flagEmoji = 'Flag emoji is required';
    }

    // Validate gradient colors (basic hex validation)
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(editing.gradientStart)) {
      errors.gradientStart = 'Invalid hex color format (e.g., #FF0000)';
    }
    if (!hexColorRegex.test(editing.gradientEnd)) {
      errors.gradientEnd = 'Invalid hex color format (e.g., #FF0000)';
    }

    // Validate ordering
    const orderingNum = Number(editing.ordering);
    if (isNaN(orderingNum) || orderingNum < 1) {
      errors.ordering = 'Ordering must be a positive number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveLanguage = async () => {
    if (!editingLanguage) return;

    if (!isAdminAuthenticated) {
      setValidationErrors({ general: 'You must be logged in as admin to update languages. Please log in via the Admin Login page.' });
      return;
    }

    if (!validateLanguageEdit(editingLanguage)) {
      return;
    }

    updateLanguage(
      {
        languageName: editingLanguage.originalName,
        newName: editingLanguage.name.trim(),
        newCode: editingLanguage.code.trim(),
        newFlag: editingLanguage.flagEmoji.trim(),
        newDirection: editingLanguage.textDirection,
        newGradientStart: editingLanguage.gradientStart.trim(),
        newGradientEnd: editingLanguage.gradientEnd.trim(),
        newOrdering: BigInt(editingLanguage.ordering),
      },
      {
        onSuccess: () => {
          setSaveSuccess(editingLanguage.originalName);
          setTimeout(() => setSaveSuccess(null), 3000);
          setEditingLanguage(null);
          setValidationErrors({});
          refetch();
        },
        onError: (error) => {
          setValidationErrors({ general: error.message });
        },
      }
    );
  };

  const handleFieldChange = (field: keyof EditingLanguage, value: string | TextDirection) => {
    if (!editingLanguage) return;
    setEditingLanguage({
      ...editingLanguage,
      [field]: value,
    });
    // Clear field-specific error when user starts editing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-modal max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl glass-text">Manage Languages</DialogTitle>
          <DialogDescription className="glass-text-muted">
            Edit language properties or remove languages. Removing a language will also delete all associated words.
          </DialogDescription>
        </DialogHeader>

        {!isAdminAuthenticated && (
          <Alert className="glass-alert bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              You must be logged in as admin to manage languages. Please log in via the Admin Login page.
            </AlertDescription>
          </Alert>
        )}

        {saveSuccess && (
          <Alert className="glass-alert bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Language updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {validationErrors.general && (
          <Alert className="glass-alert bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <AlertDescription className="text-red-800 dark:text-red-200">
              {validationErrors.general}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !languages || languages.length === 0 ? (
            <p className="text-center glass-text-muted py-8">No languages available.</p>
          ) : (
            languages.map((language) => (
              <div key={language.name}>
                {editingLanguage?.originalName === language.name ? (
                  // Edit Mode
                  <div className="p-6 border rounded-lg glass-card-inner space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold glass-text text-lg">Edit Language</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="glass-button-outline"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="edit-name" className="glass-text">
                          Language Name *
                        </Label>
                        <Input
                          id="edit-name"
                          value={editingLanguage.name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          disabled={isUpdating}
                          className={`glass-input ${validationErrors.name ? 'border-red-500' : ''}`}
                          placeholder="e.g., Turkish"
                        />
                        {validationErrors.name && (
                          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>
                        )}
                      </div>

                      {/* Code */}
                      <div className="space-y-2">
                        <Label htmlFor="edit-code" className="glass-text">
                          Language Code *
                        </Label>
                        <Input
                          id="edit-code"
                          value={editingLanguage.code}
                          onChange={(e) => handleFieldChange('code', e.target.value)}
                          disabled={isUpdating}
                          className={`glass-input ${validationErrors.code ? 'border-red-500' : ''}`}
                          placeholder="e.g., tr"
                        />
                        {validationErrors.code && (
                          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.code}</p>
                        )}
                      </div>

                      {/* Flag Emoji */}
                      <div className="space-y-2">
                        <Label htmlFor="edit-flag" className="glass-text">
                          Flag Emoji *
                        </Label>
                        <Input
                          id="edit-flag"
                          value={editingLanguage.flagEmoji}
                          onChange={(e) => handleFieldChange('flagEmoji', e.target.value)}
                          disabled={isUpdating}
                          className={`glass-input ${validationErrors.flagEmoji ? 'border-red-500' : ''}`}
                          placeholder="e.g., 🇹🇷"
                        />
                        {validationErrors.flagEmoji && (
                          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.flagEmoji}</p>
                        )}
                      </div>

                      {/* Text Direction */}
                      <div className="space-y-2">
                        <Label htmlFor="edit-direction" className="glass-text">
                          Text Direction *
                        </Label>
                        <Select
                          value={editingLanguage.textDirection}
                          onValueChange={(value) => handleFieldChange('textDirection', value as TextDirection)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger id="edit-direction" className="glass-input">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-modal">
                            <SelectItem value="ltr">LTR (Left to Right)</SelectItem>
                            <SelectItem value="rtl">RTL (Right to Left)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Gradient Start Color */}
                      <div className="space-y-2">
                        <Label htmlFor="edit-gradient-start" className="glass-text">
                          Gradient Start Color *
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="edit-gradient-start"
                            type="color"
                            value={editingLanguage.gradientStart}
                            onChange={(e) => handleFieldChange('gradientStart', e.target.value)}
                            disabled={isUpdating}
                            className="w-16 h-10 p-1 glass-input"
                          />
                          <Input
                            value={editingLanguage.gradientStart}
                            onChange={(e) => handleFieldChange('gradientStart', e.target.value)}
                            disabled={isUpdating}
                            className={`flex-1 glass-input ${validationErrors.gradientStart ? 'border-red-500' : ''}`}
                            placeholder="#DC2626"
                          />
                        </div>
                        {validationErrors.gradientStart && (
                          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.gradientStart}</p>
                        )}
                      </div>

                      {/* Gradient End Color */}
                      <div className="space-y-2">
                        <Label htmlFor="edit-gradient-end" className="glass-text">
                          Gradient End Color *
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="edit-gradient-end"
                            type="color"
                            value={editingLanguage.gradientEnd}
                            onChange={(e) => handleFieldChange('gradientEnd', e.target.value)}
                            disabled={isUpdating}
                            className="w-16 h-10 p-1 glass-input"
                          />
                          <Input
                            value={editingLanguage.gradientEnd}
                            onChange={(e) => handleFieldChange('gradientEnd', e.target.value)}
                            disabled={isUpdating}
                            className={`flex-1 glass-input ${validationErrors.gradientEnd ? 'border-red-500' : ''}`}
                            placeholder="#EA580C"
                          />
                        </div>
                        {validationErrors.gradientEnd && (
                          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.gradientEnd}</p>
                        )}
                      </div>

                      {/* Ordering */}
                      <div className="space-y-2">
                        <Label htmlFor="edit-ordering" className="glass-text">
                          Ordering *
                        </Label>
                        <Input
                          id="edit-ordering"
                          type="number"
                          min="1"
                          value={editingLanguage.ordering}
                          onChange={(e) => handleFieldChange('ordering', e.target.value)}
                          disabled={isUpdating}
                          className={`glass-input ${validationErrors.ordering ? 'border-red-500' : ''}`}
                          placeholder="1"
                        />
                        {validationErrors.ordering && (
                          <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.ordering}</p>
                        )}
                      </div>

                      {/* Gradient Preview */}
                      <div className="space-y-2">
                        <Label className="glass-text">Gradient Preview</Label>
                        <div
                          className="h-10 rounded-lg flex items-center justify-center text-2xl"
                          style={{
                            background: `linear-gradient(135deg, ${editingLanguage.gradientStart}, ${editingLanguage.gradientEnd})`,
                          }}
                        >
                          {editingLanguage.flagEmoji}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="glass-button-outline"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveLanguage}
                        disabled={isUpdating || !isAdminAuthenticated}
                        className="glass-button"
                      >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center gap-4 p-4 border rounded-lg glass-card-inner transition-all hover:shadow-md">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${language.gradientStart}, ${language.gradientEnd})`,
                      }}
                    >
                      {language.flagEmoji}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold glass-text">{language.name}</h4>
                      <p className="text-sm glass-text-muted">
                        {language.code.toUpperCase()} • {language.textDirection === 'rtl' ? 'RTL' : 'LTR'} • Order: {String(language.ordering)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(language)}
                        disabled={isUpdating || isRemoving || !!editingLanguage || !isAdminAuthenticated}
                        className="glass-button-outline"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            disabled={isRemoving || isUpdating || !!editingLanguage || !isAdminAuthenticated}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-modal">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="glass-text">Remove {language.name}?</AlertDialogTitle>
                            <AlertDialogDescription className="glass-text-muted">
                              This will permanently delete the language "{language.name}" and all associated words. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="glass-button-outline">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveLanguage(language.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove Language
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {saveSuccess === language.name && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 animate-in fade-in" />
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end items-center pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="glass-button-outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
