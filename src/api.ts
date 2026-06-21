import type { Activity, Badge, Challenge, LeaderboardEntry, InsightsData, EmissionCategory } from './types';

// Emission factors from Section 7 of EcoStride_Carbon_Footprint_Platform.md
export const EMISSION_FACTORS = {
  transport: {
    'car_petrol': 0.192, // kg CO2e / km
    'car_diesel': 0.171, // kg CO2e / km
    'bus': 0.105,        // kg CO2e / km
    'train': 0.041,      // kg CO2e / km
    'flight': 0.255,     // kg CO2e / km (domestic)
  },
  energy: {
    'electricity': 0.475, // kg CO2e / kWh
    'lpg': 2.3,           // kg CO2e / kg
    'natural_gas': 2.0    // kg CO2e / m3
  },
  food: {
    'beef': 27.0,      // kg CO2e / kg
    'lamb': 24.0,      // kg CO2e / kg
    'chicken': 6.9,    // kg CO2e / kg
    'dairy': 3.2,      // kg CO2e / kg
    'vegetables': 1.0,  // kg CO2e / kg (average for grains/veg)
  },
  shopping: {
    'electronics': 0.8, // kg CO2e / $ spent
    'fashion': 0.4,     // kg CO2e / $ spent
    'fast_fashion': 0.9,// kg CO2e / $ spent
    'furniture': 0.3    // kg CO2e / $ spent
  },
  waste: {
    'landfill_base': 1.2 // kg CO2e / kg of waste
  }
};

// Target weekly footprint in kg CO2e
export const WEEKLY_TARGET_CO2 = 75.0;

// Equivalence unit factors
// 1 tree absorbs ~20 kg CO2e per year (roughly 0.38 kg/week, but for relatable unit let's say 1 tree planted offsets 20 kg CO2e)
export const EQUIVALENCE_FACTORS = {
  tree: 20,           // 1 tree = 20 kg CO2e
  carKm: 0.192,       // 1 km driving = 0.192 kg CO2e
  phoneCharge: 0.008, // 1 phone charge = 0.008 kg CO2e
};

// Default badges list
const INITIAL_BADGES: Badge[] = [
  { id: 'first_log', name: 'First Step', description: 'Log your first carbon activity.', icon: '👣', earned: false, criteria: 'Log any activity' },
  { id: 'car_free', name: 'Car-Free Week', description: 'Log train or bus transport without driving.', icon: '🚌', earned: false, criteria: 'Log bus or train' },
  { id: 'plant_pioneer', name: 'Plant-Based Pioneer', description: 'Log vegetable meals with zero beef or lamb.', icon: '🌱', earned: false, criteria: 'Log veg/grain food' },
  { id: 'zero_waste', name: 'Zero-Waste Hero', description: 'Log a waste activity with over 80% recycling rate.', icon: '♻️', earned: false, criteria: 'Recycling rate > 80%' },
  { id: 'saving_streak', name: '1 Ton Saved Club', description: 'Accumulate enough carbon savings to equal 1 ton CO2e offset.', icon: '🏆', earned: false, criteria: 'Accumulated savings' },
  { id: 'eco_shopper', name: 'Conscious Shopper', description: 'Spend on sustainable categories or limit shopping emissions.', icon: '🛍️', earned: false, criteria: 'Log shopping' }
];

// Default challenges
const INITIAL_CHALLENGES: Challenge[] = [
  { id: 'c1', name: 'Meatless Week', description: 'Swap beef/lamb for plant-based alternatives for 7 days.', target: '0 kg beef/lamb logged', points: 150, category: 'food', duration: '7 days', active: true, joined: false, progress: 0 },
  { id: 'c2', name: 'Bus & Train Streak', description: 'Commute at least 50 km using public transit instead of driving.', target: '50 km transit logged', points: 200, category: 'transport', duration: '5 days left', active: true, joined: false, progress: 0 },
  { id: 'c3', name: 'Smart Power Saver', description: 'Reduce home electricity usage by at least 15 kWh.', target: 'Log electricity < 20 kWh', points: 180, category: 'energy', duration: '12 days left', active: true, joined: false, progress: 0 },
  { id: 'c4', name: 'Recycling Champion', description: 'Achieve an average waste recycling rate of over 75%.', target: '75%+ recycling rate', points: 120, category: 'waste', duration: '3 days left', active: true, joined: false, progress: 0 }
];

// Initial mock activities spanning the last 8 weeks
const getHistoricalMockActivities = (): Activity[] => {
  const activities: Activity[] = [];
  const now = new Date();
  
  // Week 1 (Oldest, high emissions) to Week 8 (Current)
  // Let's create weekly batches. Each week is 7 days.
  const emissionsTrend = [115, 108, 98, 92, 85, 79, 74, 52]; // Trend showing improvement
  
  for (let w = 0; w < 8; w++) {
    const daysAgo = (7 - w) * 7;
    const weekDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const targetEmissions = emissionsTrend[w];
    
    // Distribute targetEmissions into transport, energy, food, shopping, waste
    // E.g., transport ~ 40%, energy ~ 30%, food ~ 15%, shopping ~ 10%, waste ~ 5%
    const transportCO2 = targetEmissions * 0.40;
    const energyCO2 = targetEmissions * 0.30;
    const foodCO2 = targetEmissions * 0.15;
    const shoppingCO2 = targetEmissions * 0.10;
    const wasteCO2 = targetEmissions * 0.05;
    
    // Add activities for that week
    activities.push({
      id: `m-trans-${w}`,
      category: 'transport',
      subtype: 'car_petrol',
      quantity: Math.round(transportCO2 / EMISSION_FACTORS.transport.car_petrol),
      unit: 'km',
      co2e_kg: Number(transportCO2.toFixed(1)),
      timestamp: weekDate.toISOString(),
      source: 'manual'
    });
    
    activities.push({
      id: `m-energy-${w}`,
      category: 'energy',
      subtype: 'electricity',
      quantity: Math.round(energyCO2 / EMISSION_FACTORS.energy.electricity),
      unit: 'kWh',
      co2e_kg: Number(energyCO2.toFixed(1)),
      timestamp: new Date(weekDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'auto'
    });
    
    activities.push({
      id: `m-food-${w}`,
      category: 'food',
      subtype: 'beef',
      quantity: Number((foodCO2 / EMISSION_FACTORS.food.beef).toFixed(2)),
      unit: 'kg',
      co2e_kg: Number(foodCO2.toFixed(1)),
      timestamp: new Date(weekDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'manual'
    });
    
    activities.push({
      id: `m-shop-${w}`,
      category: 'shopping',
      subtype: 'fashion',
      quantity: Math.round(shoppingCO2 / EMISSION_FACTORS.shopping.fashion),
      unit: '$',
      co2e_kg: Number(shoppingCO2.toFixed(1)),
      timestamp: new Date(weekDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'manual'
    });
    
    activities.push({
      id: `m-waste-${w}`,
      category: 'waste',
      subtype: 'landfill_base',
      quantity: Math.round(wasteCO2 / (EMISSION_FACTORS.waste.landfill_base * 0.5)), // 50% recycling rate
      unit: 'kg',
      co2e_kg: Number(wasteCO2.toFixed(1)),
      timestamp: new Date(weekDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'manual'
    });
  }
  
  return activities;
};

// Helper: Get local storage data or initialize
const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(stored);
};

const setLocalStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize State
export const initializeState = () => {
  getLocalStorage('ecostride_activities', getHistoricalMockActivities());
  getLocalStorage('ecostride_badges', INITIAL_BADGES);
  getLocalStorage('ecostride_challenges', INITIAL_CHALLENGES);
  getLocalStorage('ecostride_coins', 420); // Starting eco-coins
  getLocalStorage('ecostride_streak', 5);    // Starting streak
};

// Calculate CO2 emissions for an input
export const calculateEmissions = (
  category: EmissionCategory,
  subtype: string,
  quantity: number,
  additionalData?: { recyclingRate?: number } | null
): number => {
  switch (category) {
    case 'transport': {
      const transFactor = EMISSION_FACTORS.transport[subtype as keyof typeof EMISSION_FACTORS.transport] || 0.192;
      return quantity * transFactor;
    }
    case 'energy': {
      const energyFactor = EMISSION_FACTORS.energy[subtype as keyof typeof EMISSION_FACTORS.energy] || 0.475;
      return quantity * energyFactor;
    }
    case 'food': {
      const foodFactor = EMISSION_FACTORS.food[subtype as keyof typeof EMISSION_FACTORS.food] || 1.0;
      return quantity * foodFactor;
    }
    case 'shopping': {
      const shopFactor = EMISSION_FACTORS.shopping[subtype as keyof typeof EMISSION_FACTORS.shopping] || 0.5;
      return quantity * shopFactor;
    }
    case 'waste': {
      const recyclingRate = additionalData?.recyclingRate !== undefined ? additionalData.recyclingRate / 100 : 0;
      const wasteFactor = EMISSION_FACTORS.waste.landfill_base;
      return quantity * (1 - recyclingRate) * wasteFactor;
    }
    default:
      return 0;
  }
};

// Service functions
export const api = {
  // Get all activities
  getActivities: (): Activity[] => {
    return getLocalStorage<Activity[]>('ecostride_activities', []);
  },
  
  // Log a new activity
  logActivity: (activityData: {
    category: EmissionCategory;
    subtype: string;
    quantity: number;
    unit: string;
    source?: 'manual' | 'auto' | 'scanned';
    additionalData?: { recyclingRate?: number } | null;
  }): Promise<Activity> => {
    return new Promise((resolve) => {
      // Simulate API network delay
      setTimeout(() => {
        const activities = api.getActivities();
        const co2e = calculateEmissions(
          activityData.category,
          activityData.subtype,
          activityData.quantity,
          activityData.additionalData
        );
        
        const newActivity: Activity = {
          id: `act-${Date.now()}`,
          category: activityData.category,
          subtype: activityData.subtype,
          quantity: activityData.quantity,
          unit: activityData.unit,
          co2e_kg: Number(co2e.toFixed(2)),
          timestamp: new Date().toISOString(),
          source: activityData.source || 'manual',
        };
        
        // Add to activities
        activities.push(newActivity);
        setLocalStorage('ecostride_activities', activities);
        
        // Award Eco-Coins:
        // Base reward of 10 coins.
        // If it is a low-carbon choice, give a bonus.
        let coinReward = 10;
        let isEcoFriendly = false;
        
        if (activityData.category === 'transport' && (activityData.subtype === 'bus' || activityData.subtype === 'train')) {
          coinReward += 15;
          isEcoFriendly = true;
        } else if (activityData.category === 'food' && activityData.subtype === 'vegetables') {
          coinReward += 15;
          isEcoFriendly = true;
        } else if (activityData.category === 'waste' && (activityData.additionalData?.recyclingRate ?? 0) > 50) {
          coinReward += 20;
          isEcoFriendly = true;
        }
        
        const currentCoins = getLocalStorage<number>('ecostride_coins', 0);
        setLocalStorage('ecostride_coins', currentCoins + coinReward);
        
        // Increment streak if it's a new day
        // For mock simplification, let's just increment streak by 1 if it was an eco-friendly activity
        if (isEcoFriendly) {
          const streak = getLocalStorage<number>('ecostride_streak', 0);
          setLocalStorage('ecostride_streak', streak + 1);
        }
        
        // Process badge achievements
        api.checkAndAwardBadges(newActivity);
        
        // Update challenge progress if applicable
        api.updateChallengeProgress(newActivity);
        
        resolve(newActivity);
      }, 500);
    });
  },
  
  // Get historical trend (last 8 weeks)
  getHistoricalTrend: () => {
    const activities = api.getActivities();
    const trend = [];
    const now = new Date();
    
    // Group activities into 8 weekly bins
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekActivities = activities.filter(act => {
        const actDate = new Date(act.timestamp);
        return actDate >= weekStart && actDate < weekEnd;
      });
      
      const totalCO2 = weekActivities.reduce((sum, act) => sum + act.co2e_kg, 0);
      
      // Label weeks
      let label = `${i} wks ago`;
      if (i === 0) label = 'This Week';
      else if (i === 1) label = 'Last Week';
      
      trend.push({
        week: label,
        emissions: Number(totalCO2.toFixed(1)),
        target: WEEKLY_TARGET_CO2
      });
    }
    
    return trend;
  },
  
  // Get emissions by category for the current week
  getEmissionsByCategory: (): { category: string; value: number; color: string; label: string }[] => {
    const activities = api.getActivities();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filter activities logged in the last 7 days
    const currentWeekActivities = activities.filter(act => new Date(act.timestamp) >= oneWeekAgo);
    
    const categories: Record<EmissionCategory, { value: number; color: string; label: string }> = {
      transport: { value: 0, color: 'var(--color-category-transport)', label: 'Transport' },
      energy: { value: 0, color: 'var(--color-category-energy)', label: 'Energy' },
      food: { value: 0, color: 'var(--color-category-food)', label: 'Food' },
      shopping: { value: 0, color: 'var(--color-category-shopping)', label: 'Shopping' },
      waste: { value: 0, color: 'var(--color-category-waste)', label: 'Waste' }
    };
    
    currentWeekActivities.forEach(act => {
      if (categories[act.category]) {
        categories[act.category].value += act.co2e_kg;
      }
    });
    
    // Round to 1 decimal place and format for Recharts
    return Object.entries(categories).map(([key, data]) => ({
      category: key,
      value: Number(data.value.toFixed(1)),
      color: data.color,
      label: data.label
    }));
  },
  
  // Get sustainability score (0-100) based on current week's emissions
  getSustainabilityScore: (): number => {
    const emissions = api.getEmissionsByCategory();
    const weeklyTotal = emissions.reduce((sum, cat) => sum + cat.value, 0);
    
    // Score calculation logic:
    // Perfect score (100) is achieved at 30kg or less weekly emissions.
    // Score drops linearly. At 150kg weekly emissions, score reaches baseline 20.
    // Streak bonus adds a few points.
    const baseScore = Math.max(0, 100 - ((weeklyTotal - 30) / 1.2));
    const streak = getLocalStorage<number>('ecostride_streak', 0);
    const badges = api.getBadges().filter(b => b.earned).length;
    
    const finalScore = Math.round(baseScore + (streak * 0.5) + (badges * 1.5));
    return Math.max(10, Math.min(100, finalScore)); // Clamped between 10 and 100
  },
  
  // Get Eco-Coin balance
  getEcoCoins: (): number => {
    return getLocalStorage<number>('ecostride_coins', 0);
  },
  
  // Get Current Streak
  getStreak: (): number => {
    return getLocalStorage<number>('ecostride_streak', 0);
  },
  
  // Get badges list
  getBadges: (): Badge[] => {
    return getLocalStorage<Badge[]>('ecostride_badges', INITIAL_BADGES);
  },
  
  // Get challenges list
  getChallenges: (): Challenge[] => {
    return getLocalStorage<Challenge[]>('ecostride_challenges', INITIAL_CHALLENGES);
  },
  
  // Join a challenge
  joinChallenge: (challengeId: string): Challenge[] => {
    const challenges = api.getChallenges();
    const updated = challenges.map(ch => {
      if (ch.id === challengeId) {
        return { ...ch, joined: true };
      }
      return ch;
    });
    setLocalStorage('ecostride_challenges', updated);
    return updated;
  },
  
  // Get weekly insights & AI text
  getInsights: (): InsightsData => {
    const trend = api.getHistoricalTrend();
    const currentWeekTotal = trend[7].emissions;
    const lastWeekTotal = trend[6].emissions;
    
    // Percentage change
    let weeklyChange = 0;
    if (lastWeekTotal > 0) {
      weeklyChange = Number(((currentWeekTotal - lastWeekTotal) / lastWeekTotal * 100).toFixed(1));
    }
    
    // Trees equivalency (1 tree offsets ~20 kg CO2e)
    const treesEquivalent = Math.round(currentWeekTotal / EQUIVALENCE_FACTORS.tree);
    
    // Mock AI coach explanation text based on emission profile
    let aiCoachMessage: string;
    
    if (weeklyChange < 0) {
      aiCoachMessage = `Fantastic news! Your footprint is down by ${Math.abs(weeklyChange)}% compared to last week. The main driver of this savings was a decrease in your Transportation emissions, likely from opting for the bus or train over driving. This change alone offsets the equivalent of planting ${treesEquivalent} trees! Let's keep this momentum going into next week.`;
    } else if (weeklyChange > 0) {
      aiCoachMessage = `Your footprint saw an increase of ${weeklyChange}% this week. Analyzing your activities, it looks like your Energy usage spiked, possibly due to higher heating/cooling, or you logged a shopping item with high carbon intensity. Try using a programmable thermostat or swapping beef/lamb meals for plant-based dishes next week to bring your score back up!`;
    } else {
      aiCoachMessage = "Your carbon footprint remained stable this week. To make an impact and earn more Eco-Coins, try taking public transit for one commute or logging a completely vegetarian day. Every small change adds up to a large stride!";
    }
    
    return {
      weeklyChange,
      weeklyTotalCO2: Number(currentWeekTotal.toFixed(1)),
      peerComparison: {
        user: Math.round(currentWeekTotal),
        average: 84 // City average weekly emissions in kg CO2e
      },
      equivalence: {
        value: treesEquivalent,
        unit: "trees",
        description: `= ${treesEquivalent} mature trees planted (to absorb this week's CO₂e in a year)`
      },
      aiCoachMessage
    };
  },
  
  // Get Leaderboards
  getLeaderboard: (type: 'city' | 'friends' | 'cohort'): LeaderboardEntry[] => {
    const userScore = api.getSustainabilityScore();
    
    const cityList: LeaderboardEntry[] = [
      { rank: 1, username: 'EcoWarrior99', score: 94, avatar: '🦊' },
      { rank: 2, username: 'GreenQueen', score: 89, avatar: '🐱' },
      { rank: 3, username: 'SolarPowerSam', score: 85, avatar: '🦁' },
      { rank: 4, username: 'You (EcoStrider)', score: userScore, avatar: '🚶', isCurrentUser: true },
      { rank: 5, username: 'CycleChef', score: 71, avatar: '🐼' },
      { rank: 6, username: 'ZeroWasteZac', score: 68, avatar: '🐸' }
    ];
    
    const friendsList: LeaderboardEntry[] = [
      { rank: 1, username: 'Alice_Green', score: 82, avatar: '🐰' },
      { rank: 2, username: 'You (EcoStrider)', score: userScore, avatar: '🚶', isCurrentUser: true },
      { rank: 3, username: 'BobCommutes', score: 64, avatar: '🐻' },
      { rank: 4, username: 'Charlie_LoverOfBeef', score: 45, avatar: '🐷' }
    ];
    
    const cohortList: LeaderboardEntry[] = [
      { rank: 1, username: 'SolarPowerSam', score: 85, avatar: '🦁' },
      { rank: 2, username: 'You (EcoStrider)', score: userScore, avatar: '🚶', isCurrentUser: true },
      { rank: 3, username: 'OfficeWorkerGreen', score: 72, avatar: '🐨' },
      { rank: 4, username: 'TransitToby', score: 60, avatar: '🐯' }
    ];
    
    const list = type === 'city' ? cityList : type === 'friends' ? friendsList : cohortList;
    return list.sort((a, b) => b.score - a.score).map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  },
  
  // Check and award badges based on newly logged activity
  checkAndAwardBadges: (activity: Activity) => {
    const badges = api.getBadges();
    let updated = false;
    
    const newBadges = badges.map(badge => {
      if (badge.earned) return badge;
      
      let earned = false;
      if (badge.id === 'first_log') {
        earned = true;
      } else if (badge.id === 'car_free' && activity.category === 'transport' && (activity.subtype === 'bus' || activity.subtype === 'train')) {
        earned = true;
      } else if (badge.id === 'plant_pioneer' && activity.category === 'food' && activity.subtype === 'vegetables') {
        earned = true;
      } else if (badge.id === 'zero_waste' && activity.category === 'waste' && activity.subtype === 'landfill_base') {
        // Mock recycling rate from quantity/recycling details if present
        earned = true; 
      } else if (badge.id === 'eco_shopper' && activity.category === 'shopping') {
        earned = true;
      }
      
      if (earned) {
        updated = true;
        // Award bonus coins for earning a badge!
        const currentCoins = getLocalStorage<number>('ecostride_coins', 0);
        setLocalStorage('ecostride_coins', currentCoins + 50);
        
        return {
          ...badge,
          earned: true,
          earnedAt: new Date().toISOString()
        };
      }
      
      return badge;
    });
    
    if (updated) {
      setLocalStorage('ecostride_badges', newBadges);
    }
  },
  
  // Update challenge progress
  updateChallengeProgress: (activity: Activity) => {
    const challenges = api.getChallenges();
    let updated = false;
    
    const newChallenges = challenges.map(ch => {
      if (!ch.joined) return ch;
      
      let progress = ch.progress;
      if (ch.id === 'c2' && activity.category === 'transport' && (activity.subtype === 'bus' || activity.subtype === 'train')) {
        // Commute streak progress
        progress = Math.min(100, ch.progress + (activity.quantity / 50) * 100);
      } else if (ch.id === 'c1' && activity.category === 'food' && activity.subtype === 'vegetables') {
        // Vegetarian meal logged
        progress = Math.min(100, ch.progress + 20); // 5 meals to complete
      } else if (ch.id === 'c3' && activity.category === 'energy' && activity.subtype === 'electricity') {
        progress = Math.min(100, ch.progress + 25);
      } else if (ch.id === 'c4' && activity.category === 'waste') {
        progress = Math.min(100, ch.progress + 30);
      }
      
      if (progress !== ch.progress) {
        updated = true;
        
        // If challenge completed just now, award points!
        if (progress === 100 && ch.progress < 100) {
          const currentCoins = getLocalStorage<number>('ecostride_coins', 0);
          setLocalStorage('ecostride_coins', currentCoins + ch.points);
        }
        
        return { ...ch, progress: Number(progress.toFixed(0)) };
      }
      
      return ch;
    });
    
    if (updated) {
      setLocalStorage('ecostride_challenges', newChallenges);
    }
  }
};
