import { useState, useEffect, useRef } from 'react';
import { ChallengeCard } from './ChallengeCard';
import './ChallengeGrid.css';
import type { Challenge } from '../data/challenges'; // Import Challenge type
import { challenges as allChallengesData } from '../data/challenges'; // Import actual challenges data

interface ChallengeBox {
  id: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}

interface StoredPixelArt {
  challengeId: number;
  pixels: string[][];
}

interface ChallengeGridProps {
  title: string;
  description: string;
  storageKey?: string;
  pixelArtStorageKey?: string; // New key for pixel art
  totalChallenges?: number;
}

const initialChallengesState = (totalChallenges: number) => {
  // No need to clear storageKey here, it's handled by the component's initial load or reset explicitly
  return Array.from({ length: totalChallenges }, (_, index) => ({
    id: index + 1,
    isUnlocked: index === 0,
    isCompleted: false,
  }));
};

export const ChallengeGrid = ({
  title,
  description,
  storageKey = 'challengeProgress',
  pixelArtStorageKey = 'pixelArtChallengesData', // Default for new key
  totalChallenges = allChallengesData.length // Use actual length from imported challenges
}: ChallengeGridProps) => {
  const [challenges, setChallenges] = useState<ChallengeBox[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsedChallenges = JSON.parse(saved);
        // Basic validation: check if it's an array and has the expected structure
        if (Array.isArray(parsedChallenges) && parsedChallenges.every(c => 'id' in c && 'isUnlocked' in c && 'isCompleted' in c)) {
            // Ensure the loaded state matches the total number of challenges
            if (parsedChallenges.length === totalChallenges) {
                return parsedChallenges;
            } else {
                console.warn('Saved challenge count mismatch. Resetting challenges.');
                localStorage.removeItem(storageKey); // Clear inconsistent data
            }
        }
      } catch (e) {
        console.error('Failed to parse challenges from localStorage', e);
        localStorage.removeItem(storageKey); // Clear corrupted data
      }
    }
    return initialChallengesState(totalChallenges);
  });

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null); // Now stores the full Challenge object
  const gridRef = useRef<HTMLDivElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const challengeCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(challenges));
  }, [challenges, storageKey]);

  useEffect(() => {
    if (selectedChallenge && challengeCardRef.current) {
      challengeCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [selectedChallenge]);

  const handleComplete = (id: number) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === id) {
        return { ...challenge, isCompleted: true };
      }
      // Unlock next challenge only if it exists
      if (challenge.id === id + 1 && id < totalChallenges) { 
        return { ...challenge, isUnlocked: true };
      }
      return challenge;
    }));
    setSelectedChallenge(null);
  };

  // New function to save pixel art and complete challenge
  const handleSavePixelArt = (challengeId: number, pixels: string[][]) => {
    const currentPixelArtData = localStorage.getItem(pixelArtStorageKey);
    let allSavedArt: StoredPixelArt[] = [];
    if (currentPixelArtData) {
      try {
        allSavedArt = JSON.parse(currentPixelArtData);
      } catch (e) {
        console.error('Failed to parse pixel art from localStorage', e);
        // Potentially clear corrupted data: localStorage.removeItem(pixelArtStorageKey);
      }
    }

    const existingArtIndex = allSavedArt.findIndex(art => art.challengeId === challengeId);
    if (existingArtIndex > -1) {
      allSavedArt[existingArtIndex].pixels = pixels;
    } else {
      allSavedArt.push({ challengeId, pixels });
    }
    localStorage.setItem(pixelArtStorageKey, JSON.stringify(allSavedArt));
    handleComplete(challengeId); // Mark as complete in the main progression
  };


  const handleChallengeClick = (challengeBox: ChallengeBox) => {
    if (challengeBox.isUnlocked) {
      const fullChallengeData = allChallengesData.find(c => c.id === challengeBox.id);
      if (fullChallengeData) {
        setSelectedChallenge(fullChallengeData);
      } else {
        console.error(`Challenge data not found for ID: ${challengeBox.id}`);
        setSelectedChallenge(null); // Or handle as an error state
      }
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all challenge progress? This cannot be undone. All saved pixel art will also be erased.'
    );
    if (confirmed) {
      localStorage.removeItem(storageKey); // Clear main progress
      localStorage.removeItem(pixelArtStorageKey); // Clear pixel art data
      setChallenges(initialChallengesState(totalChallenges));
      setSelectedChallenge(null);
    }
    if (resetButtonRef.current) {
      resetButtonRef.current.blur();
    }
  };

  const getInsertPosition = (id: number) => {
    if (!gridRef.current) return 0;

    const challengeBoxElements = Array.from(gridRef.current.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child.classList.contains('challenge-box')
    );

    if (challengeBoxElements.length === 0 || challengeBoxElements[0].clientWidth === 0) {
      const estimatedMinBoxWidth = 120;
      const gridWidth = gridRef.current.offsetWidth;
      const defaultBoxesPerRow = Math.max(1, Math.floor(gridWidth / estimatedMinBoxWidth));
      
      const row = Math.floor((id - 1) / defaultBoxesPerRow);
      return (row + 1) * defaultBoxesPerRow;
    }

    const boxWidth = challengeBoxElements[0].clientWidth;
    const gridWidth = gridRef.current.offsetWidth;
    const boxesPerRow = Math.max(1, Math.floor(gridWidth / boxWidth)); 

    const row = Math.floor((id - 1) / boxesPerRow);
    return (row + 1) * boxesPerRow;
  };

  const renderChallenges = () => {
    const items = challenges.map((challengeBox) => (
      <div
        key={challengeBox.id}
        className={`challenge-box ${challengeBox.isUnlocked ? 'unlocked' : ''} ${challengeBox.isCompleted ? 'completed' : ''}`}
        onClick={() => handleChallengeClick(challengeBox)}
      >
        <span className="challenge-number">{challengeBox.id}</span>
        {challengeBox.isCompleted && <span className="completed-text">Complete</span>}
      </div>
    ));

    if (selectedChallenge) {
      const position = getInsertPosition(selectedChallenge.id);
      let initialPixelsForCard: string[][] | undefined = undefined;
      if (selectedChallenge.challengeType === 'pixel-art') {
        const savedPixelArtData = localStorage.getItem(pixelArtStorageKey);
        if (savedPixelArtData) {
          try {
            const allSavedArt: StoredPixelArt[] = JSON.parse(savedPixelArtData);
            const artEntry = allSavedArt.find(art => art.challengeId === selectedChallenge.id);
            if (artEntry) {
              initialPixelsForCard = artEntry.pixels;
            }
          } catch (e) {
            console.error('Failed to parse saved pixel art for card', e);
          }
        }
      }

      const isChallengeCompleted = challenges.find(c => c.id === selectedChallenge.id)?.isCompleted || false;

      const cardElement = (
        <div key="challenge-card-wrapper" ref={challengeCardRef} style={{ gridColumn: '1 / -1' }}>
          <ChallengeCard
            challenge={selectedChallenge} // Pass the full challenge object
            onClose={() => setSelectedChallenge(null)}
            // onComplete will be handled by onSavePixelArt for pixel art challenges
            // For non-pixel art, we might need a different onComplete or adjust logic
            onSavePixelArt={selectedChallenge.challengeType === 'pixel-art' ? handleSavePixelArt : undefined}
            initialPixels={initialPixelsForCard}
            isReadOnly={isChallengeCompleted} // Pixel art is read-only if the main challenge is marked completed
            onCompleteStandardChallenge={selectedChallenge.challengeType !== 'pixel-art' ? () => handleComplete(selectedChallenge.id) : undefined}
          />
        </div>
      );
      items.splice(position, 0, cardElement);
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
      <button 
        onClick={handleReset} 
        className="reset-button" 
        ref={resetButtonRef}
      >
        Reset Progress
      </button>
    </div>
  );
}; 