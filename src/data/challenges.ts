export interface Challenge {
  id: number;
  title: string;
  description: string;
  tips: string[];
  category: "writing" | "visual" | "music" | "thinking" | "mixed";
  estimatedTime: string;
  difficulty: "easy" | "medium" | "hard";
  challengeType?: "pixel-art"; // Optional: indicates special component
  challengeProps?: {
    // Props for the special component
    gridSize?: number;
    // other challenge-type specific props can be added here
  };
}

export const challenges: Challenge[] = [
  {
    id: 1,
    title: "Pixelart 8x8",
    description:
      "Create a tiny piece of pixel art on an 8x8 grid. Embrace the minimalism!",
    tips: [
      "Think simple shapes and icons.",
      "Every pixel counts!",
      "Experiment with just two or three colors.",
    ],
    category: "visual",
    estimatedTime: "15-30 minutes",
    difficulty: "easy",
    challengeType: "pixel-art",
    challengeProps: {
      gridSize: 8,
    },
  },
  {
    id: 2,
    title: "Pixelart 16x16",
    description:
      "The classic 16x16 grid, a favorite for icons and sprites. Show your skills!",
    tips: [
      "Many retro game sprites are 16x16.",
      "Think about shading and highlights, even with few pixels.",
      "Outline your shapes first.",
    ],
    category: "visual",
    estimatedTime: "30-60 minutes",
    difficulty: "easy",
    challengeType: "pixel-art",
    challengeProps: {
      gridSize: 16,
    },
  },
  {
    id: 3,
    title: "Pixelart 24x24",
    description:
      "More space at 24x24! Try creating a small scene or a more detailed character.",
    tips: [
      "You can start to build more complex forms.",
      "Anti-aliasing techniques (manual pixel placement) can smooth edges.",
      "Don't be afraid to use more colors if your concept needs it.",
    ],
    category: "visual",
    estimatedTime: "45-75 minutes",
    difficulty: "medium",
    challengeType: "pixel-art",
    challengeProps: {
      gridSize: 24,
    },
  },
  {
    id: 4,
    title: "Pixelart 32x32",
    description:
      "A 32x32 grid offers a good balance for detailed sprites or small illustrations.",
    tips: [
      "This size is common for player characters in indie games.",
      "Consider the overall composition of your image.",
      "Experiment with patterns and textures.",
    ],
    category: "visual",
    estimatedTime: "60-90 minutes",
    difficulty: "medium",
    challengeType: "pixel-art",
    challengeProps: {
      gridSize: 32,
    },
  },
  // Other challenges removed (comment remains for context, but no actual other challenges here yet)
];
