import { ChallengeGrid } from './ChallengeGrid';

export const CreativityChallenge = () => {
  return (
    <ChallengeGrid
      title="30 Days of Creativity"
      description="Complete one creative task each day. The next task unlocks only after finishing the current one."
      storageKey="creativityProgress"
      totalChallenges={30}
    />
  );
}; 