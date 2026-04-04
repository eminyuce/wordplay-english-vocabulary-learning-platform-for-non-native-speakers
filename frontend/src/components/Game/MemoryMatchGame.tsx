import { useState, useEffect, useMemo } from 'react';
import type { Word, Language } from '../../backend';
import { DifficultySelector as DifficultySelectorType, Difficulty } from '../../backend';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft } from 'lucide-react';
import { useRecordGameRound } from '../../hooks/useQueries';
import { toast } from 'sonner';
import DifficultySelector from './DifficultySelector';
import GameCompletionScreen from './GameCompletionScreen';

interface MemoryMatchGameProps {
  words: Word[];
  language: Language;
  onClose: () => void;
}

type CardType = {
  id: number;
  text: string;
  type: 'english' | 'foreign';
  wordId: number;
  isFlipped: boolean;
  isMatched: boolean;
};

export default function MemoryMatchGame({ words, language, onClose }: MemoryMatchGameProps) {
  const { mutate: recordGameRound } = useRecordGameRound();
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultySelectorType>(DifficultySelectorType.all);
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [correctMatches, setCorrectMatches] = useState(0);

  const filteredWords = useMemo(() => {
    if (selectedDifficulty === DifficultySelectorType.all) return words;
    // Cast DifficultySelector to Difficulty for comparison
    return words.filter(w => w.difficulty === (selectedDifficulty as unknown as Difficulty));
  }, [words, selectedDifficulty]);

  const gameWords = useMemo(() => {
    return [...filteredWords].sort(() => Math.random() - 0.5).slice(0, Math.min(8, filteredWords.length));
  }, [filteredWords]);

  const totalPairs = gameWords.length;

  useEffect(() => {
    const cardPairs: CardType[] = [];
    gameWords.forEach((word, idx) => {
      cardPairs.push({
        id: idx * 2,
        text: word.english,
        type: 'english',
        wordId: idx,
        isFlipped: false,
        isMatched: false,
      });
      cardPairs.push({
        id: idx * 2 + 1,
        text: word.foreign,
        type: 'foreign',
        wordId: idx,
        isFlipped: false,
        isMatched: false,
      });
    });
    
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, [gameWords]);

  const handleDifficultyChange = (newDifficulty: DifficultySelectorType) => {
    setSelectedDifficulty(newDifficulty);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setCorrectMatches(0);
    setIsComplete(false);
    setIsProcessing(false);
  };

  const handleCardClick = (cardId: number) => {
    if (isProcessing || flippedCards.length === 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.wordId === secondCard.wordId) {
        toast.success('Match! 🎉', { duration: 1000 });
        setCorrectMatches(prev => prev + 1);
        
        setTimeout(() => {
          setCards(prevCards => prevCards.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          ));
          setFlippedCards([]);
          setMatches(prev => prev + 1);
          setIsProcessing(false);
          
          if (matches + 1 === totalPairs) {
            setTimeout(() => {
              setIsComplete(true);
              // Record game round for analytics
              recordGameRound({
                gameMode: 'Memory Match',
                totalQuestions: totalPairs,
                correctAnswers: totalPairs,
              });
            }, 500);
          }
        }, 600);
      } else {
        toast.error('Not a match!', { duration: 1000 });
        
        setTimeout(() => {
          setCards(prevCards => prevCards.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1200);
      }
    }
  };

  const handleRestart = () => {
    setIsComplete(false);
    setMoves(0);
    setMatches(0);
    setCorrectMatches(0);
    setFlippedCards([]);
    setIsProcessing(false);
    
    const cardPairs: CardType[] = [];
    gameWords.forEach((word, idx) => {
      cardPairs.push({
        id: idx * 2,
        text: word.english,
        type: 'english',
        wordId: idx,
        isFlipped: false,
        isMatched: false,
      });
      cardPairs.push({
        id: idx * 2 + 1,
        text: word.foreign,
        type: 'foreign',
        wordId: idx,
        isFlipped: false,
        isMatched: false,
      });
    });
    
    setCards(cardPairs.sort(() => Math.random() - 0.5));
  };

  if (filteredWords.length < 2) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">Not enough words for the selected difficulty. At least 2 words are required.</p>
              <DifficultySelector value={selectedDifficulty} onChange={handleDifficultyChange} />
              <Button onClick={onClose}>Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <GameCompletionScreen
        score={totalPairs}
        totalQuestions={totalPairs}
        correctAnswers={totalPairs}
        onPlayAgain={handleRestart}
        onClose={onClose}
        gameMode="Memory Match"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{
              background: `linear-gradient(135deg, ${language.gradientStart}, ${language.gradientEnd})`,
            }}
          >
            {language.flagEmoji}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Memory Match</h2>
            <p className="text-sm text-muted-foreground">Match English with {language.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Moves: {moves}</p>
          <p className="text-sm text-muted-foreground">Matches: {matches}/{totalPairs}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <DifficultySelector value={selectedDifficulty} onChange={handleDifficultyChange} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              card.isMatched ? 'opacity-40 cursor-not-allowed' : ''
            } ${card.isFlipped && !card.isMatched ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <CardContent className="p-6 h-32 flex items-center justify-center">
              {card.isFlipped || card.isMatched ? (
                <p className="text-center font-semibold text-sm break-words">{card.text}</p>
              ) : (
                <div className="text-4xl">❓</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
