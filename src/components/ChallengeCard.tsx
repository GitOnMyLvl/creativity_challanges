import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './ChallengeCard.css';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

interface ChallengeCardProps {
  id: number;
  onClose: () => void;
  onComplete: () => void;
}

export const ChallengeCard = ({ id, onClose, onComplete }: ChallengeCardProps) => {
  return (
    <div className="challenge-card">
      <button className="close-button" onClick={onClose}>
        <FontAwesomeIcon icon={faXmark} style={{ width: '1em', height: '1em' }} />
      </button>
      
      <div className="challenge-card-content">
        <h2>Challenge #{id}</h2>
        <p className="challenge-description">
          This is where the specific challenge description will go.
        </p>
        
        <div className="challenge-completion-area">
          {/* This area will be customized per challenge */}
          <p className="placeholder-text">Challenge completion area will be customized per challenge.</p>
        </div>
        
        <div className="challenge-card-actions">
          <button className="complete-button" onClick={onComplete}>
            <FontAwesomeIcon icon={faCheck} className="button-icon" />
            Complete Challenge
          </button>
        </div>
      </div>
    </div>
  );
}; 