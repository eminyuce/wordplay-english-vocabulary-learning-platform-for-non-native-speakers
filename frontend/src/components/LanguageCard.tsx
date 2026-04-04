import type { Language } from '../backend';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { BookOpen } from 'lucide-react';

interface LanguageCardProps {
  language: Language;
  onSelect: () => void;
}

export default function LanguageCard({ language, onSelect }: LanguageCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
  };

  return (
    <Card 
      className="material-card cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      onClick={handleClick}
    >
      <div 
        className="h-24 flex items-center justify-center text-5xl transition-transform duration-300 group-hover:scale-110"
        style={{
          background: `linear-gradient(135deg, ${language.gradientStart}, ${language.gradientEnd})`,
        }}
      >
        {language.flagEmoji}
      </div>
      <CardContent className="p-4">
        <h3 className="text-base font-semibold mb-3 text-center truncate">{language.name}</h3>
        <Button 
          size="sm"
          className="w-full gap-2 text-xs shadow-sm"
          onClick={handleButtonClick}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Learn English
        </Button>
      </CardContent>
    </Card>
  );
}
