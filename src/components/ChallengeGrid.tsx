import { useState, useEffect, useRef } from 'react';
import { ChallengeCard } from './ChallengeCard';
import './ChallengeGrid.css';

interface ChallengeBox {
  id: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}

interface ChallengeGridProps {
  title: string;
  description: string;
  storageKey?: string;
  totalChallenges?: number;
}

export const ChallengeGrid = ({
  title,
  description,
  storageKey = 'challengeProgress',
  totalChallenges = 30
}: ChallengeGridProps) => {
  const [challenges, setChallenges] = useState<ChallengeBox[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
    return Array.from({ length: totalChallenges }, (_, index) => ({
      id: index + 1,
      isUnlocked: index === 0,
      isCompleted: false,
    }));
  });

  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(challenges));
  }, [challenges, storageKey]);

  const handleComplete = (id: number) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === id) {
        return { ...challenge, isCompleted: true };
      }
      if (challenge.id === id + 1) {
        return { ...challenge, isUnlocked: true };
      }
      return challenge;
    }));
    setSelectedChallenge(null);
  };

  const handleChallengeClick = (id: number, isUnlocked: boolean) => {
    if (isUnlocked && !challenges[id - 1].isCompleted) {
      setSelectedChallenge(id);
    }
  };

  // Calculate the position to insert the challenge card
  const getInsertPosition = (id: number) => {
    if (!gridRef.current) return 0;
    const boxes = gridRef.current.children;
    const boxesPerRow = Math.floor(gridRef.current.offsetWidth / boxes[0].clientWidth);
    const row = Math.floor((id - 1) / boxesPerRow);
    return (row + 1) * boxesPerRow - 1;
  };

  const renderChallenges = () => {
    const items = challenges.map(({ id, isUnlocked, isCompleted }) => (
      <div
        key={id}
        className={`challenge-box ${isUnlocked ? 'unlocked' : ''} ${isCompleted ? 'completed' : ''}`}
        onClick={() => handleChallengeClick(id, isUnlocked)}
      >
        <span className="challenge-number">{id}</span>
        {isCompleted && <span className="completed-text">Complete</span>}
      </div>
    ));

    if (selectedChallenge) {
      const position = getInsertPosition(selectedChallenge);
      items.splice(position, 0, 
        <ChallengeCard
          key="challenge-card"
          id={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          onComplete={() => handleComplete(selectedChallenge)}
        />
      );
    }

    return items;
  };

  return (
    <div className="challenge-container">
      <h1>{title}</h1>
      <p className="description">{description}</p>
      <div className="challenge-grid" ref={gridRef}>
        {renderChallenges()}
      </div>
    </div>
  );
}; 