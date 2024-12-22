interface Competitor {
  homeAway: 'home' | 'away';
  score: string;
  team: {
    name: string;
    abbreviation: string;
  };
}

interface Game {
  id: string;
  competitions: Array<{
    competitors: Competitor[];
  }>;
  // ... other fields ...
} 