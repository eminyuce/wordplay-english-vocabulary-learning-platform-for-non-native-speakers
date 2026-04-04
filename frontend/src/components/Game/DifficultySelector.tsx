import { useEffect } from 'react';
import { DifficultySelector as DifficultySelectorType } from '../../backend';
import { useGetCallerUserPreferences, useUpdateCallerUserPreferences } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

interface DifficultySelectorProps {
  value: DifficultySelectorType;
  onChange: (value: DifficultySelectorType) => void;
  className?: string;
}

export default function DifficultySelector({ value, onChange, className }: DifficultySelectorProps) {
  const { identity } = useInternetIdentity();
  const { data: preferences } = useGetCallerUserPreferences();
  const { mutate: updatePreferences } = useUpdateCallerUserPreferences();

  useEffect(() => {
    if (preferences && identity && preferences.difficulty) {
      onChange(preferences.difficulty);
    }
  }, [preferences, identity]);

  const handleChange = (newValue: DifficultySelectorType) => {
    onChange(newValue);

    if (identity && preferences) {
      updatePreferences({
        difficulty: newValue,
        lastSelectedLanguage: preferences.lastSelectedLanguage,
      });
    }
  };

  const options: { value: DifficultySelectorType; label: string }[] = [
    { value: 'all' as DifficultySelectorType, label: 'All' },
    { value: 'beginner' as DifficultySelectorType, label: 'Beginner' },
    { value: 'medium' as DifficultySelectorType, label: 'Medium' },
    { value: 'hard' as DifficultySelectorType, label: 'Hard' },
    { value: 'advanced' as DifficultySelectorType, label: 'Advanced' },
  ];

  return (
    <div className={className}>
      <label className="text-sm font-bold mb-3 block text-foreground uppercase tracking-wide">
        Difficulty Level
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleChange(option.value)}
              className={`
                relative px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200
                border-2 focus:outline-none focus:ring-4 focus:ring-sky-400/30
                ${
                  isActive
                    ? 'bg-sky-200 dark:bg-sky-300 text-gray-900 border-sky-400 dark:border-sky-500 shadow-lg scale-105 z-10'
                    : 'bg-card text-card-foreground border-border hover:border-sky-300 hover:bg-accent hover:scale-102 shadow-sm'
                }
              `}
              type="button"
              aria-pressed={isActive}
              aria-label={`Select ${option.label} difficulty`}
            >
              <span className="relative z-10">{option.label}</span>
              {isActive && (
                <div className="absolute inset-0 bg-sky-300/20 rounded-lg animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
