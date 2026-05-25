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

interface FlashcardsGameProps {
  words: Word[];
  language: Language;
  languageName: string;
  onClose: () => void;
}

const FlashcardsGame: React.FC<FlashcardsGameProps> = ({
  words: allWords,
  language,
  languageName: _languageName,
  onClose,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType>(
    "all" as DifficultyType,
  );
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [gameWords, setGameWords] = useState<Word[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [knownCount, setKnownCount] = useState(0);

  const {
    currentMessage,
    showOverlay,
    checkProgress,
    resetProgress,
    dismissOverlay,
  } = useSessionProgress(20);

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

      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(20, shuffled.length));
      setGameWords(selected);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setShowCompletion(false);
      setKnownCount(0);
      resetProgress();
    }
  }, [allWords, selectedDifficulty, resetProgress]);

  useEffect(() => {
    checkProgress(currentCardIndex);
  }, [currentCardIndex, checkProgress]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnown = () => {
    setKnownCount(knownCount + 1);
    handleNext();
  };

  const handleUnknown = () => {
    handleNext();
  };

  const handleNext = () => {
    if (currentCardIndex < gameWords.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      checkReward(knownCount, gameWords.length);
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
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(20, shuffled.length));
    setGameWords(selected);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowCompletion(false);
    setKnownCount(0);
    resetProgress();
    closeReward();
  };

  if (gameWords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Words Available
          </h2>
          <p className="text-gray-600 mb-6">
            There are not enough words for the selected difficulty level.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
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
        score={knownCount}
        totalQuestions={gameWords.length}
        onContinue={handleContinue}
        onClose={onClose}
        gameMode="Flashcards"
      />
    );
  }

  const currentWord = gameWords[currentCardIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Compact Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{language.flagEmoji}</span>
            <h1 className="text-xl font-bold text-gray-800">Flashcards</h1>
            <button
              type="button"
              onClick={onClose}
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
          <div className="mt-3 px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">
                Card {currentCardIndex + 1}/{gameWords.length}
              </span>
              <span className="font-semibold text-orange-600">
                Known: {knownCount}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFlip}
          className="bg-white rounded-lg shadow-lg p-12 mb-6 cursor-pointer hover:shadow-xl transition-shadow min-h-[300px] flex items-center justify-center w-full text-left"
        >
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-800 mb-4">
              {isFlipped ? currentWord.foreign : currentWord.english}
            </p>
            <p className="text-sm text-gray-500">
              {isFlipped ? "Translation" : "Click to reveal translation"}
            </p>
          </div>
        </button>

        {/* Action Buttons */}
        {isFlipped && (
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleUnknown}
              className="py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              Don't Know
            </button>
            <button
              type="button"
              onClick={handleKnown}
              className="py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Know It
            </button>
          </div>
        )}

        {/* Next Button (when not flipped) */}
        {!isFlipped && currentCardIndex > 0 && (
          <button
            type="button"
            onClick={handleNext}
            className="next-question-button"
          >
            {currentCardIndex < gameWords.length - 1 ? "Next Card" : "Finish"}
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

export default FlashcardsGame;
