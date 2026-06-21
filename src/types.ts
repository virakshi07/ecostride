export type EmissionCategory = 'transport' | 'energy' | 'food' | 'shopping' | 'waste';

export interface Activity {
  id: string;
  category: EmissionCategory;
  subtype: string;
  quantity: number;
  unit: string;
  co2e_kg: number;
  timestamp: string;
  source: 'manual' | 'auto' | 'scanned';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
  criteria: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  target: string;
  points: number;
  category: EmissionCategory | 'general';
  duration: string;
  active: boolean;
  joined: boolean;
  progress: number; // 0 to 100
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number; // Sustainability Score (0-100)
  avatar?: string;
  isCurrentUser?: boolean;
}

export interface InsightsData {
  weeklyChange: number; // percentage (positive is increase, negative is decrease)
  weeklyTotalCO2: number; // kg
  peerComparison: {
    user: number; // user average kg CO2e/week
    average: number; // city average kg CO2e/week
  };
  equivalence: {
    value: number;
    unit: string;
    description: string; // e.g. "= 12 trees planted"
  };
  aiCoachMessage: string;
}
