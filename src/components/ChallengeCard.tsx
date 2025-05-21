import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck, faClock, faLightbulb, faSave } from '@fortawesome/free-solid-svg-icons';
import type { Challenge } from '../data/challenges';
import './ChallengeCard.css';
import { PixelArtGrid } from './PixelArtGrid';

interface ChallengeCardProps {
  challenge: Challenge;
  onClose: () => void;
  onSavePixelArt?: (challengeId: number, pixels: string[][]) => void;
  initialPixels?: string[][];
  isReadOnly?: boolean;
  onCompleteStandardChallenge?: () => void;
}

export const ChallengeCard = ({
  challenge,
  onClose,
  onSavePixelArt,
  initialPixels,
  isReadOnly = false,
  onCompleteStandardChallenge,
}: ChallengeCardProps) => {
  const [currentPixelArt, setCurrentPixelArt] = useState<string[][] | undefined>(initialPixels);

  if (!challenge) {
    return (
      <div className="challenge-card error-card">
        <button className="close-button" onClick={onClose} aria-label="Close error">
          <FontAwesomeIcon icon={faXmark} style={{ width: '1em', height: '1em' }} />
        </button>
        <p>Challenge data not found!</p>
        <div className="challenge-card-actions">
          <button className="cancel-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const handlePixelArtChange = (pixels: string[][]) => {
    if (!isReadOnly) {
      setCurrentPixelArt(pixels);
    }
  };

  const renderChallengeSpecificContent = (currentChallenge: Challenge) => {
    if (currentChallenge.challengeType === 'pixel-art' && currentChallenge.challengeProps?.gridSize) {
      return (
        <PixelArtGrid
          gridSize={currentChallenge.challengeProps.gridSize}
          initialPixels={initialPixels}
          isReadOnly={isReadOnly}
          onPixelsChange={handlePixelArtChange}
        />
      );
    }
    return (
      <textarea
        placeholder="Write your reflections or paste your work here..."
        rows={4}
        className="reflection-input"
        disabled={isReadOnly}
      />
    );
  };

  const handleSaveArt = () => {
    if (onSavePixelArt && challenge.challengeType === 'pixel-art' && currentPixelArt) {
      onSavePixelArt(challenge.id, currentPixelArt);
      onClose();
    } else if (onSavePixelArt && challenge.challengeType === 'pixel-art' && !currentPixelArt && initialPixels) {
      onSavePixelArt(challenge.id, initialPixels);
      onClose();
    } else {
      console.warn('Could not save pixel art: No callback or current art data available');
    }
  };

  return (
    <div className="challenge-card">
      <button className="close-button" onClick={onClose} aria-label="Close challenge">
        <FontAwesomeIcon icon={faXmark} style={{ width: '1em', height: '1em' }} />
      </button>
      
      <div className="challenge-card-content">
        <div className="challenge-header">
          <h2>Challenge #{challenge.id}: {challenge.title}</h2>
          <span className={`difficulty-badge ${challenge.difficulty}`}>
            {challenge.difficulty}
          </span>
        </div>

        <div className="challenge-meta">
          <span className="category-tag">{challenge.category}</span>
          <span className="time-estimate">
            <FontAwesomeIcon icon={faClock} /> {challenge.estimatedTime}
          </span>
        </div>
        
        <p className="challenge-description">{challenge.description}</p>
        
        {challenge.tips && challenge.tips.length > 0 && (
          <div className="tips-section">
            <h3>
              <FontAwesomeIcon icon={faLightbulb} /> Tips
            </h3>
            <ul>
              {challenge.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="challenge-completion-area">
          {renderChallengeSpecificContent(challenge)}
        </div>
        
        {!isReadOnly && (
          <div className="challenge-card-actions">
            {challenge.challengeType === 'pixel-art' && onSavePixelArt && (
              <button className="save-art-button complete-button" onClick={handleSaveArt}>
                <FontAwesomeIcon icon={faSave} className="button-icon" />
                Save & Complete Art
              </button>
            )}
            {challenge.challengeType !== 'pixel-art' && onCompleteStandardChallenge && (
              <button className="complete-button" onClick={() => { onCompleteStandardChallenge(); onClose(); }}>
                <FontAwesomeIcon icon={faCheck} className="button-icon" />
                Mark as Complete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 