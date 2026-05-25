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

interface MeaningMatchGameProps {
  words: Word[];
  language: Language;
  languageName: string;
  onClose: () => void;
}

const MeaningMatchGame: React.FC<MeaningMatchGameProps> = ({
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
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameWords, setGameWords] = useState<Word[]>([]);
  const [options, setOptions] = useState<string[]>([]);
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

      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(10, shuffled.length));
      setGameWords(selected);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowCompletion(false);
      resetProgress();
    }
  }, [allWords, selectedDifficulty, resetProgress]);

  useEffect(() => {
    if (gameWords.length > 0 && currentQuestionIndex < gameWords.length) {
      generateOptions();
    }
  }, [currentQuestionIndex, gameWords]);

  useEffect(() => {
    checkProgress(currentQuestionIndex);
  }, [currentQuestionIndex, checkProgress]);

  const generateOptions = () => {
    if (gameWords.length === 0) return;
    const currentWord = gameWords[currentQuestionIndex];
    const correctAnswer = currentWord.foreign;

    const otherWords = gameWords.filter(
      (_, idx) => idx !== currentQuestionIndex,
    );
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
    const wrongAnswers = shuffledOthers.slice(0, 3).map((w) => w.foreign);

    const allOptions = [correctAnswer, ...wrongAnswers].sort(
      () => Math.random() - 0.5,
    );
    setOptions(allOptions);
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const currentWord = gameWords[currentQuestionIndex];
    const correct = answer === currentWord.foreign;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < gameWords.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
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
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));
    setGameWords(selected);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowCompletion(false);
    resetProgress();
    closeReward();
  };

  const handleBackClick = () => {
    // Clean up state before navigation
    setSelectedAnswer(null);
    setIsCorrect(null);
    resetProgress();
    closeReward();
    onClose();
  };

  if (gameWords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Words Available
          </h2>
          <p className="text-gray-600 mb-6">
            There are not enough words for the selected difficulty level.
          </p>
          <button
            type="button"
            onClick={handleBackClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        gameMode="Meaning Match"
      />
    );
  }

  const currentWord = gameWords[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Compact Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={handleBackClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 font-medium transition-all duration-200 hover:shadow-md backdrop-blur-sm border border-blue-200"
              aria-label="Back to Language Page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <span className="text-3xl">{language.flagEmoji}</span>
            <h1 className="text-xl font-bold text-gray-800">Meaning Match</h1>
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
          <div className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">
                Q {currentQuestionIndex + 1}/{gameWords.length}
              </span>
              <span className="font-semibold text-blue-600">
                Score: {score}
              </span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            What is the meaning of:
          </h2>
          <p className="text-3xl font-bold text-blue-600 mb-6">
            {currentWord.english}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option, _index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === currentWord.foreign;
              const showCorrect = selectedAnswer !== null && isCorrectAnswer;
              const showIncorrect = isSelected && !isCorrect;

              let optionClass = "game-option ";
              if (showCorrect) {
                optionClass += "game-option-correct";
              } else if (showIncorrect) {
                optionClass += "game-option-incorrect";
              } else if (isSelected) {
                optionClass += "game-option-selected";
              } else if (selectedAnswer !== null) {
                optionClass += "game-option-disabled";
              } else {
                optionClass += "game-option-default";
              }

              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                  className={optionClass}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next Button */}
        {selectedAnswer !== null && (
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

export default MeaningMatchGame;
