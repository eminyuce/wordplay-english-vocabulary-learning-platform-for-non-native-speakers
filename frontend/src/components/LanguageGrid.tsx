import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Language } from '../backend';
import { Button } from '@/components/ui/button';

interface LanguageGridProps {
  languages: Language[];
}

export default function LanguageGrid({ languages }: LanguageGridProps) {
  const navigate = useNavigate();

  const handleLanguageClick = (languageName: string) => {
    navigate({ to: `/language/${languageName}` });
  };

  if (languages.length === 0) {
    return null; // Parent component handles empty state
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {languages.map((language) => (
        <div
          key={language.name}
          className="glass-card p-6 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => handleLanguageClick(language.name)}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">{language.flagEmoji}</div>
            <h3 className="text-xl font-bold glass-text mb-2">{language.name}</h3>
            <p className="text-sm glass-text opacity-70 mb-4">
              Learn English with {language.name}
            </p>
            <Button className="glass-button w-full">
              Start Learning
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
