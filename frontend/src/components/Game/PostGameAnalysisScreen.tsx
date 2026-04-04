import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useGetRandomMotivationalQuote } from '../../hooks/useQueries';

interface PostGameAnalysisScreenProps {
  correctAnswers: number;
  incorrectAnswers: number;
  onContinue: () => void;
  onClose: () => void;
}

export default function PostGameAnalysisScreen({
  correctAnswers,
  incorrectAnswers,
  onContinue,
  onClose,
}: PostGameAnalysisScreenProps) {
  const { data: quote, isLoading: quoteLoading } = useGetRandomMotivationalQuote();

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const totalQuestions = correctAnswers + incorrectAnswers;
  const accuracyPercentage = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Liquid Glass Modal Container */}
      <div 
        className="relative w-full max-w-md bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="analysis-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close analysis"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Title */}
        <h2 
          id="analysis-title"
          className="text-2xl sm:text-3xl font-bold text-white text-center mb-6"
        >
          Game Complete!
        </h2>

        {/* Stats Section */}
        <div className="space-y-4 mb-6">
          {/* Accuracy Circle */}
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeDasharray={`${accuracyPercentage * 2.83} 283`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {accuracyPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Answer Breakdown */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Correct Answers */}
            <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
              <div className="text-green-300 text-sm font-medium mb-1">Correct</div>
              <div className="text-3xl font-bold text-white">{correctAnswers}</div>
            </div>

            {/* Incorrect Answers */}
            <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-400/30">
              <div className="text-red-300 text-sm font-medium mb-1">Incorrect</div>
              <div className="text-3xl font-bold text-white">{incorrectAnswers}</div>
            </div>
          </div>
        </div>

        {/* Motivational Quote Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 mb-6 border border-white/10 min-h-[100px] flex items-center justify-center">
          {quoteLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className="text-white/90 text-center text-base sm:text-lg italic leading-relaxed">
              "{quote?.text || 'Great job completing the game!'}"
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
