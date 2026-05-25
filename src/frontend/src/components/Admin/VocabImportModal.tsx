import {
  AlertCircle,
  CheckCircle2,
  ClipboardPaste,
  FileJson,
  Upload,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { Difficulty, type Word } from "../../backend";
import { useBulkImportWords } from "../../hooks/useQueries";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

interface VocabImportModalProps {
  open: boolean;
  onClose: () => void;
}

interface ValidationError {
  entryIndex: number;
  errors: string[];
  entry: any;
}

interface ImportSummary {
  totalEntries: number;
  validEntries: number;
  invalidEntries: number;
  importedCount: number;
  entryErrors: ValidationError[];
}

export default function VocabImportModal({
  open,
  onClose,
}: VocabImportModalProps) {
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>("");
  const [validEntries, setValidEntries] = useState<Word[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: bulkImportWords, isPending } = useBulkImportWords();

  const validateEntry = (
    entry: any,
    _index: number,
  ): { valid: boolean; errors: string[]; entry: Word | null } => {
    const errors: string[] = [];

    if (
      !entry.english ||
      typeof entry.english !== "string" ||
      entry.english.trim() === ""
    ) {
      errors.push(
        'Missing or invalid "english" field (must be non-empty string)',
      );
    }

    if (
      !entry.foreign ||
      typeof entry.foreign !== "string" ||
      entry.foreign.trim() === ""
    ) {
      errors.push(
        'Missing or invalid "foreign" field (must be non-empty string)',
      );
    }

    if (
      !entry.language ||
      typeof entry.language !== "string" ||
      entry.language.trim() === ""
    ) {
      errors.push(
        'Missing or invalid "language" field (must be non-empty string)',
      );
    }

    if (!entry.difficulty || typeof entry.difficulty !== "string") {
      errors.push('Missing or invalid "difficulty" field');
    } else {
      const normalizedDifficulty = entry.difficulty.trim();
      const validDifficulties = ["Beginner", "Medium", "Hard", "Advanced"];
      const matchedDifficulty = validDifficulties.find(
        (d) => d.toLowerCase() === normalizedDifficulty.toLowerCase(),
      );
      if (!matchedDifficulty) {
        errors.push(
          `Invalid difficulty "${entry.difficulty}". Must be one of: Beginner, Medium, Hard, Advanced`,
        );
      }
    }

    if (!Array.isArray(entry.examples)) {
      errors.push('Missing or invalid "examples" field (must be an array)');
    } else if (entry.examples.length === 0) {
      errors.push(
        "Examples array cannot be empty (at least 1 example required)",
      );
    } else if (entry.examples.length > 5) {
      errors.push("Maximum 5 examples allowed per word");
    } else {
      for (let i = 0; i < entry.examples.length; i++) {
        if (
          typeof entry.examples[i] !== "string" ||
          entry.examples[i].trim() === ""
        ) {
          errors.push(`Example ${i + 1} must be a non-empty string`);
        }
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors, entry: null };
    }

    const normalizedDifficulty = entry.difficulty.trim().toLowerCase();
    let difficultyEnum: Difficulty;
    if (normalizedDifficulty === "beginner") {
      difficultyEnum = Difficulty.beginner;
    } else if (normalizedDifficulty === "medium") {
      difficultyEnum = Difficulty.medium;
    } else if (normalizedDifficulty === "hard") {
      difficultyEnum = Difficulty.hard;
    } else if (normalizedDifficulty === "advanced") {
      difficultyEnum = Difficulty.advanced;
    } else {
      difficultyEnum = Difficulty.beginner;
    }

    const validEntry: Word = {
      id: BigInt(0), // Will be assigned by backend
      english: entry.english.trim(),
      foreign: entry.foreign.trim(),
      languageName: entry.language.trim(),
      difficulty: difficultyEnum,
      examples: entry.examples.map((ex: string) => ex.trim()),
      addedAt: BigInt(Date.now()) * BigInt(1000000), // Convert to nanoseconds
    };

    return { valid: true, errors: [], entry: validEntry };
  };

  const processJSONContent = (text: string) => {
    setValidationError(null);
    setImportSummary(null);
    setValidationErrors([]);
    setValidEntries([]);

    try {
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (parseError: any) {
        throw new Error(`Invalid JSON syntax: ${parseError.message}`);
      }

      if (!Array.isArray(data)) {
        throw new Error("JSON must contain an array of vocabulary entries");
      }

      if (data.length === 0) {
        throw new Error("JSON array is empty (no entries to import)");
      }

      const validatedEntries: Word[] = [];
      const errors: ValidationError[] = [];

      for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        const result = validateEntry(entry, i);

        if (result.valid && result.entry) {
          validatedEntries.push(result.entry);
        } else {
          errors.push({
            entryIndex: i + 1,
            errors: result.errors,
            entry,
          });
        }
      }

      setValidationErrors(errors);
      setValidEntries(validatedEntries);

      if (validatedEntries.length === 0) {
        setValidationError(
          `All ${data.length} entries are invalid. Please fix the errors and try again.`,
        );
      } else if (errors.length > 0) {
        setValidationError(
          `${validatedEntries.length} valid entries ready for import. ${errors.length} invalid entries will be skipped.`,
        );
      }
    } catch (error: any) {
      setValidationError(error.message || "Failed to parse JSON content");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    try {
      const text = await selectedFile.text();
      processJSONContent(text);
    } catch (error: any) {
      setValidationError(error.message || "Failed to read JSON file");
      setFile(null);
    }
  };

  const handlePasteValidate = () => {
    if (!pastedText.trim()) {
      setValidationError("Please paste JSON content before validating");
      return;
    }
    processJSONContent(pastedText);
  };

  const handleImport = () => {
    if (validEntries.length === 0) return;

    const totalEntries = validEntries.length + validationErrors.length;

    setProgress({ current: 0, total: validEntries.length });
    setImportSummary(null);

    bulkImportWords(validEntries, {
      onSuccess: (result) => {
        setProgress(null);
        setImportSummary({
          totalEntries,
          validEntries: validEntries.length,
          invalidEntries: validationErrors.length,
          importedCount: Number(result.count),
          entryErrors: validationErrors,
        });
      },
      onError: () => {
        setProgress(null);
      },
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setFile(null);
      setPastedText("");
      setValidEntries([]);
      setValidationErrors([]);
      setValidationError(null);
      setProgress(null);
      setImportSummary(null);
      setInputMode("upload");
      onClose();
    }
  };

  const handleModeChange = (mode: string) => {
    if (mode === "upload" || mode === "paste") {
      setInputMode(mode);
      setFile(null);
      setPastedText("");
      setValidEntries([]);
      setValidationErrors([]);
      setValidationError(null);
      setImportSummary(null);
    }
  };

  const progressPercentage = progress
    ? (progress.current / progress.total) * 100
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-modal max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 glass-text">
            <FileJson className="w-5 h-5" />
            Import Vocabulary from JSON
          </DialogTitle>
          <DialogDescription className="glass-text-muted">
            Upload a JSON file or paste JSON content directly. English word is
            the unique primary key. Duplicate words and duplicate example
            sentences are skipped automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs value={inputMode} onValueChange={handleModeChange}>
            <TabsList className="grid w-full grid-cols-2 glass-tabs">
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload JSON
              </TabsTrigger>
              <TabsTrigger value="paste" className="gap-2">
                <ClipboardPaste className="w-4 h-4" />
                Paste JSON
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="glass-card-inner border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isPending}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                  className="gap-2 glass-button"
                >
                  <Upload className="w-4 h-4" />
                  {file ? "Change File" : "Select JSON File"}
                </Button>
                {file && (
                  <p className="mt-2 text-sm glass-text-muted">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="paste" className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder={`Paste your JSON content here...\n\n[\n  {\n    "english": "hello",\n    "foreign": "merhaba",\n    "language": "Turkish",\n    "difficulty": "Beginner",\n    "examples": ["Hello, how are you?", "She said hello."]\n  }\n]`}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  disabled={isPending}
                  className="min-h-[200px] font-mono text-sm glass-input"
                />
                <Button
                  onClick={handlePasteValidate}
                  disabled={!pastedText.trim() || isPending}
                  className="w-full gap-2 glass-button"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Validate Pasted JSON
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {validationError && (
            <Alert
              variant={validEntries.length > 0 ? "default" : "destructive"}
              className="glass-alert"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {(validEntries.length > 0 || validationErrors.length > 0) &&
            !importSummary && (
              <div className="space-y-2">
                <Alert className="glass-alert">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong>Validation Complete:</strong>
                    <div className="mt-2 space-y-1 text-sm">
                      <div>
                        ✅ <strong>Valid entries:</strong> {validEntries.length}
                      </div>
                      <div>
                        ❌ <strong>Invalid entries:</strong>{" "}
                        {validationErrors.length}
                      </div>
                    </div>
                    <div className="mt-2 text-xs glass-text-muted">
                      Languages:{" "}
                      {Array.from(
                        new Set(validEntries.map((e) => e.languageName)),
                      ).join(", ") || "None"}
                    </div>
                    <div className="mt-1 text-xs glass-text-muted">
                      Only valid entries will be imported. Duplicate English
                      words and duplicate example sentences are skipped
                      automatically.
                    </div>
                  </AlertDescription>
                </Alert>

                {validationErrors.length > 0 && (
                  <details className="glass-card-inner rounded-lg p-3">
                    <summary className="cursor-pointer font-medium text-sm flex items-center gap-2 glass-text">
                      <XCircle className="w-4 h-4 text-destructive" />
                      View {validationErrors.length} Invalid Entr
                      {validationErrors.length !== 1 ? "ies" : "y"} with Errors
                    </summary>
                    <ScrollArea className="h-48 mt-3">
                      <div className="space-y-3 pr-4">
                        {validationErrors.map((error) => (
                          <div
                            key={error.entryIndex}
                            className="border-l-2 border-destructive pl-3 py-1"
                          >
                            <div className="font-medium text-sm glass-text">
                              Entry {error.entryIndex}
                            </div>
                            <div className="text-xs glass-text-muted mt-1">
                              English: {error.entry?.english || "(missing)"} |
                              Language: {error.entry?.language || "(missing)"} |
                              Difficulty:{" "}
                              {error.entry?.difficulty || "(missing)"}
                            </div>
                            <ul className="mt-1 space-y-0.5">
                              {error.errors.map((err, idx) => (
                                <li
                                  key={`error-${error.entryIndex}-${idx}`}
                                  className="text-xs text-destructive"
                                >
                                  • {err}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </details>
                )}
              </div>
            )}

          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm glass-text">
                <span>Importing vocabulary...</span>
                <span>
                  {progress.current} / {progress.total}
                </span>
              </div>
              <Progress value={progressPercentage} className="glass-progress" />
              <p className="text-xs glass-text-muted text-center">
                Processing validated entries with strict deduplication
              </p>
            </div>
          )}

          {importSummary && (
            <div className="space-y-3">
              <Alert className="glass-alert">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>Import Complete!</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>
                      📊 <strong>Total entries processed:</strong>{" "}
                      {importSummary.totalEntries}
                    </div>
                    <div>
                      ✅ <strong>Valid entries:</strong>{" "}
                      {importSummary.validEntries}
                    </div>
                    <div>
                      ❌ <strong>Invalid entries skipped:</strong>{" "}
                      {importSummary.invalidEntries}
                    </div>
                    <div className="border-t pt-1 mt-2">
                      <div>
                        ➕ <strong>Words imported:</strong>{" "}
                        {importSummary.importedCount}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs glass-text-muted">
                    Note: Duplicate English words and duplicate example
                    sentences are skipped automatically.
                  </div>
                </AlertDescription>
              </Alert>

              {importSummary.entryErrors.length > 0 && (
                <details className="glass-card-inner rounded-lg p-3">
                  <summary className="cursor-pointer font-medium text-sm flex items-center gap-2 glass-text">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    View Per-Entry Error Details (
                    {importSummary.entryErrors.length} entries)
                  </summary>
                  <ScrollArea className="h-48 mt-3">
                    <div className="space-y-3 pr-4">
                      {importSummary.entryErrors.map((error) => (
                        <div
                          key={error.entryIndex}
                          className="border-l-2 border-orange-600 pl-3 py-1"
                        >
                          <div className="font-medium text-sm glass-text">
                            Entry {error.entryIndex}
                          </div>
                          <ul className="mt-1 space-y-0.5">
                            {error.errors.map((err, idx) => (
                              <li
                                key={`row-error-${error.entryIndex}-${idx}`}
                                className="text-xs text-orange-600"
                              >
                                • {err}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </details>
              )}
            </div>
          )}

          <details className="text-sm">
            <summary className="cursor-pointer font-medium mb-2 glass-text">
              View JSON Format & Deduplication Rules
            </summary>
            <div className="space-y-3">
              <pre className="glass-card-inner p-3 rounded-lg overflow-x-auto text-xs">
                {`[
  {
    "english": "hello",
    "foreign": "merhaba",
    "language": "Turkish",
    "difficulty": "Beginner",
    "examples": [
      "Hello, how are you?",
      "She said hello to everyone."
    ]
  },
  {
    "english": "beautiful",
    "foreign": "güzel",
    "language": "Turkish",
    "difficulty": "Medium",
    "examples": [
      "What a beautiful day!",
      "She has a beautiful smile.",
      "The sunset was beautiful."
    ]
  }
]`}
              </pre>
              <div className="space-y-2 text-xs glass-text-muted">
                <p>
                  <strong>Strict Validation Rules (per entry):</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>english:</strong> String, non-empty (required)
                  </li>
                  <li>
                    <strong>foreign:</strong> String, non-empty (required)
                  </li>
                  <li>
                    <strong>language:</strong> String, non-empty (required)
                  </li>
                  <li>
                    <strong>difficulty:</strong> Must be one of: Beginner,
                    Medium, Hard, Advanced (case-insensitive, required)
                  </li>
                  <li>
                    <strong>examples:</strong> Array of strings, 1-5 examples,
                    each non-empty (required)
                  </li>
                </ul>
                <p className="mt-2">
                  <strong>Strict Deduplication Rules:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>English word is the unique primary key</strong>{" "}
                    across all imports
                  </li>
                  <li>
                    If English word does NOT exist, creates new word entry with
                    example sentences
                  </li>
                  <li>
                    If English word EXISTS, checks each incoming example
                    sentence
                  </li>
                  <li>
                    Adds only new example sentences that don't already exist for
                    that word
                  </li>
                  <li>Skips importing if all sentences already exist</li>
                  <li>
                    Never creates duplicate English words or duplicate example
                    sentences
                  </li>
                  <li>
                    Duplicates are handled silently without errors or warnings
                  </li>
                </ul>
                <p className="mt-2">
                  <strong>Processing Rules:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Each entry is validated independently before import</li>
                  <li>
                    Invalid entries are skipped entirely without failing the
                    import
                  </li>
                  <li>
                    Detailed error reasons provided for each invalid entry
                  </li>
                  <li>Import is idempotent and append-only per English word</li>
                </ul>
              </div>
            </div>
          </details>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="glass-button-outline"
          >
            {importSummary ? "Close" : "Cancel"}
          </Button>
          {!importSummary && (
            <Button
              onClick={handleImport}
              disabled={validEntries.length === 0 || isPending}
              className="glass-button"
            >
              {isPending
                ? "Importing..."
                : `Import ${validEntries.length} Words`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
