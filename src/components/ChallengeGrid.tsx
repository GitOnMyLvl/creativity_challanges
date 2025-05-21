import { useState, useEffect } from 'react';
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
  };

  return (
    <div className="challenge-container">
      <h1>{title}</h1>
      <p className="description">{description}</p>
      <div className="challenge-grid">
        {challenges.map(({ id, isUnlocked, isCompleted }) => (
          <div
            key={id}
            className={`challenge-box ${isUnlocked ? 'unlocked' : ''} ${isCompleted ? 'completed' : ''}`}
          >
            <span className="challenge-number">{id}</span>
            {isUnlocked && !isCompleted && (
              <button
                className="complete-button"
                onClick={() => handleComplete(id)}
              >
                Complete
              </button>
            )}
            {isCompleted && (
              <span className="completed-text">Complete</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 