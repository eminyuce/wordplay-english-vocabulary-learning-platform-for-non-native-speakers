import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Lock, User, RefreshCw, Shield } from 'lucide-react';

// Generate a random arithmetic challenge
function generateChallenge(): { question: string; answer: number } {
  const operations = ['+', '-'] as const;
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1: number;
  let num2: number;
  let answer: number;
  
  if (operation === '+') {
    num1 = Math.floor(Math.random() * 20) + 1;
    num2 = Math.floor(Math.random() * 20) + 1;
    answer = num1 + num2;
  } else {
    num1 = Math.floor(Math.random() * 20) + 10;
    num2 = Math.floor(Math.random() * num1);
    answer = num1 - num2;
  }
  
  return {
    question: `${num1} ${operation} ${num2} = ?`,
    answer
  };
}

export default function AdminLoginForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [challenge, setChallenge] = useState(generateChallenge());
  const [challengeError, setChallengeError] = useState(false);
  const { login, isLoggingIn } = useAdminAuth();

  useEffect(() => {
    setChallenge(generateChallenge());
  }, []);

  const regenerateChallenge = () => {
    setChallenge(generateChallenge());
    setChallengeAnswer('');
    setChallengeError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim() || !challengeAnswer.trim()) {
      return;
    }

    // Validate arithmetic challenge first
    const userAnswer = parseInt(challengeAnswer.trim(), 10);
    if (isNaN(userAnswer) || userAnswer !== challenge.answer) {
      setChallengeError(true);
      regenerateChallenge();
      return;
    }

    setChallengeError(false);
    
    // Attempt backend login
    const success = await login(username, password);
    
    if (success) {
      // Navigate to admin dashboard on successful login
      navigate({ to: '/admin' });
    } else {
      // Regenerate challenge on failed login
      regenerateChallenge();
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      {/* Glass Card */}
      <div className="w-full max-w-md bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="p-8 pb-6 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm flex items-center justify-center border border-white/20 dark:border-gray-700/30 shadow-lg">
            <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-center tracking-tight text-gray-900 dark:text-white">Admin Login</h2>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Complete the challenge and enter your credentials
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
          {/* Arithmetic Challenge - Glass Style */}
          <div className="space-y-3 p-5 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg">
            <div className="flex items-center justify-between">
              <label htmlFor="challenge" className="text-base font-semibold text-gray-900 dark:text-white">
                Human Verification
              </label>
              <button
                type="button"
                onClick={regenerateChallenge}
                className="h-9 w-9 p-0 rounded-full bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all flex items-center justify-center shadow-lg"
                title="Generate new challenge"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/30 shadow-inner">
              <p className="text-3xl font-mono font-bold text-center py-3 text-purple-600 dark:text-purple-400">
                {challenge.question}
              </p>
            </div>
            <input
              id="challenge"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter the answer"
              value={challengeAnswer}
              onChange={(e) => {
                setChallengeAnswer(e.target.value);
                setChallengeError(false);
              }}
              className={`w-full text-center text-lg h-12 px-4 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border ${
                challengeError 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-white/20 dark:border-gray-700/30'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-lg`}
              disabled={isLoggingIn}
              required
              autoComplete="off"
            />
            {challengeError && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium animate-in fade-in">
                Incorrect answer. Please try again.
              </p>
            )}
          </div>

          {/* Username Field - Glass Style */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-900 dark:text-white">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
              <input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 h-12 px-4 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-lg"
                disabled={isLoggingIn}
                required
                autoComplete="username"
              />
            </div>
          </div>
          
          {/* Password Field - Glass Style */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-white">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 h-12 px-4 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-lg"
                disabled={isLoggingIn}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Submit Button - Glass Style */}
          <button 
            type="submit" 
            className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
            disabled={isLoggingIn || !username.trim() || !password.trim() || !challengeAnswer.trim()}
          >
            {isLoggingIn ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
