import { ArrowLeft } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type {
  Difficulty,
  DifficultySelector as DifficultyType,
  Language,
  Word,
} from "../../backend";
import { useGameReward } from "../../lib/gameRewards";
import { useSessionProgress } from "../../lib/sessionProgress";
import DifficultySelector from "./DifficultySelector";
import GameCompletionScreen from "./GameCompletionScreen";
import ProgressMotivationOverlay from "./ProgressMotivationOverlay";

interface GapFillGameProps {
  words: Word[];
  language: Language;
  languageName: string;
  onClose: () => void;
}

const GapFillGame: React.FC<GapFillGameProps> = ({
  words: allWords,
  language,
  languageName: _languageName,
  onClose,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType>(
    "all" as DifficultyType,
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameWords, setGameWords] = useState<Word[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);

  const {
    currentMessage,
    showOverlay,
    checkProgress,
    resetProgress,
    dismissOverlay,
  } = useSessionProgress(10);

  const {
    checkReward,
    showReward: _showReward,
    rewardQuote: _rewardQuote,
    rewardSuccessRate: _rewardSuccessRate,
    closeReward,
  } = useGameReward();

  useEffect(() => {
    if (allWords.length > 0) {
      const filtered =
        selectedDifficulty === "all"
          ? allWords
          : allWords.filter(
              (w) =>
                w.difficulty === (selectedDifficulty as unknown as Difficulty),
            );

      const wordsWithExamples = filtered.filter(
        (w) => w.examples && w.examples.length > 0,
      );
      const shuffled = [...wordsWithExamples].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(10, shuffled.length));
      setGameWords(selected);
      setCurrentQuestionIndex(0);
      setScore(0);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(null);
      setShowCompletion(false);
      resetProgress();
    }
  }, [allWords, selectedDifficulty, resetProgress]);

  useEffect(() => {
    checkProgress(currentQuestionIndex);
  }, [currentQuestionIndex, checkProgress]);

  const handleSubmit = () => {
    if (userAnswer.trim() === "") return;

    const currentWord = gameWords[currentQuestionIndex];
    const correct =
      userAnswer.trim().toLowerCase() === currentWord.english.toLowerCase();
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < gameWords.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      const finalScore = score + (isCorrect ? 1 : 0);
      checkReward(finalScore, gameWords.length);
      setShowCompletion(true);
    }
  };

  const handleContinue = () => {
    const filtered =
      selectedDifficulty === "all"
        ? allWords
        : allWords.filter(
            (w) =>
              w.difficulty === (selectedDifficulty as unknown as Difficulty),
          );
    const wordsWithExamples = filtered.filter(
      (w) => w.examples && w.examples.length > 0,
    );
    const shuffled = [...wordsWithExamples].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));
    setGameWords(selected);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswer("");
    setIsAnswered(false);
    setIsCorrect(null);
    setShowCompletion(false);
    resetProgress();
    closeReward();
  };

  const handleBackClick = () => {
    // Clean up state before navigation
    setUserAnswer("");
    setIsAnswered(false);
    setIsCorrect(null);
    resetProgress();
    closeReward();
    onClose();
  };

  if (gameWords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Words Available
          </h2>
          <p className="text-gray-600 mb-6">
            There are not enough words with examples for the selected difficulty
            level.
          </p>
          <button
            type="button"
            onClick={handleBackClick}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Language Page
          </button>
        </div>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <GameCompletionScreen
        score={score}
        totalQuestions={gameWords.length}
        onContinue={handleContinue}
        onClose={handleBackClick}
        gameMode="Gap-Fill Sentence"
      />
    );
  }

  const currentWord = gameWords[currentQuestionIndex];
  const exampleSentence = currentWord.examples[0];
  const gappedSentence = exampleSentence.replace(
    new RegExp(`\\b${currentWord.english}\\b`, "gi"),
    "______",
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Compact Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={handleBackClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 text-green-700 font-medium transition-all duration-200 hover:shadow-md backdrop-blur-sm border border-green-200"
              aria-label="Back to Language Page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <span className="text-3xl">{language.flagEmoji}</span>
            <h1 className="text-xl font-bold text-gray-800">
              Gap-Fill Sentence
            </h1>
            <button
              type="button"
              onClick={handleBackClick}
              className="ml-auto text-gray-500 hover:text-gray-700 text-2xl leading-none"
              aria-label="Close game"
            >
              ×
            </button>
          </div>

          <DifficultySelector
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
          />

          {/* Combined Progress and Score Section */}
          <div className="mt-3 px-4 py-2 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">
                Q {currentQuestionIndex + 1}/{gameWords.length}
              </span>
              <span className="font-semibold text-green-600">
                Score: {score}
              </span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Fill in the blank:
          </h2>
          <p className="text-xl text-gray-800 mb-4 leading-relaxed">
            {gappedSentence}
          </p>

          <div className="mb-4">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: pre-existing */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your answer:
            </label>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isAnswered) {
                  handleSubmit();
                }
              }}
              disabled={isAnswered}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 disabled:bg-gray-100"
              placeholder="Type the missing word..."
            />
          </div>

          {isAnswered && (
            <div
              className={`p-4 rounded-lg ${
                isCorrect
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isCorrect ? (
                <p className="font-semibold">✓ Correct!</p>
              ) : (
                <p className="font-semibold">
                  ✗ Incorrect. The correct answer is: {currentWord.english}
                </p>
              )}
            </div>
          )}

          {!isAnswered && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={userAnswer.trim() === ""}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          )}
        </div>

        {/* Next Button */}
        {isAnswered && (
          <button
            type="button"
            onClick={handleNext}
            className="next-question-button"
          >
            {currentQuestionIndex < gameWords.length - 1
              ? "Next Question"
              : "Finish Game"}
          </button>
        )}
      </div>

      <ProgressMotivationOverlay
        message={currentMessage}
        isVisible={showOverlay}
        onDismiss={dismissOverlay}
      />
    </div>
  );
};

export default GapFillGame;
