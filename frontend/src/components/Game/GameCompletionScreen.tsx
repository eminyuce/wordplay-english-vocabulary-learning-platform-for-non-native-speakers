import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useGetRandomMotivationalQuote } from '../../hooks/useQueries';
import { Sparkles, Loader2 } from 'lucide-react';

interface GameCompletionScreenProps {
  score: number;
  totalQuestions: number;
  correctAnswers?: number;
  onPlayAgain?: () => void;
  onContinue?: () => void;
  onClose: () => void;
  gameMode?: string;
}

export default function GameCompletionScreen({
  score,
  totalQuestions,
  correctAnswers,
  onPlayAgain,
  onContinue,
  onClose,
}: GameCompletionScreenProps) {
  const accuracy = correctAnswers && totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const { data: motivationalQuote, isLoading: quoteLoading, refetch } = useGetRandomMotivationalQuote();

  // Fetch a new quote when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  const handlePrimaryAction = () => {
    if (onContinue) {
      onContinue();
    } else if (onPlayAgain) {
      onPlayAgain();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-modal max-w-md w-full p-8 text-center">
        <h2 className="text-3xl font-bold glass-text mb-4">Game Complete!</h2>
        
        <div className="space-y-4 mb-6">
          <div className="glass-card p-4">
            <p className="text-sm glass-text opacity-80 mb-1">Score</p>
            <p className="text-4xl font-bold glass-text">{score}</p>
          </div>
          
          {correctAnswers !== undefined && (
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <p className="text-sm glass-text opacity-80 mb-1">Correct</p>
                <p className="text-2xl font-bold glass-text">{correctAnswers}/{totalQuestions}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-sm glass-text opacity-80 mb-1">Accuracy</p>
                <p className="text-2xl font-bold glass-text">{accuracy}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Motivational Quote Section */}
        <div className="glass-card-inner p-6 mb-6 shadow-md">
          <div className="flex justify-center mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          {quoteLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            <p className="text-lg font-medium italic glass-text leading-relaxed">
              "{motivationalQuote?.text || 'Great job completing the game!'}"
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {(onPlayAgain || onContinue) && (
            <Button onClick={handlePrimaryAction} className="flex-1 glass-button">
              {onContinue ? 'Continue' : 'Play Again'}
            </Button>
          )}
          <Button onClick={onClose} variant="outline" className="flex-1 glass-button-outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
