import React, { useState } from 'react';
import { api } from '../api';
import AnimatedCount from '../components/AnimatedCount';
import type { Badge } from '../types';
import { Award, Coins, ShoppingBag, Gift, ArrowUpRight } from 'lucide-react';

interface RewardItem {
  id: string;
  name: string;
  partner: string;
  cost: number;
  description: string;
  icon: string;
}

const REWARDS_STORE: RewardItem[] = [
  { id: 'r1', name: 'Plant 1 Tree Credit', partner: 'One Tree Planted', cost: 100, description: 'Directly fund the planting of one native tree in California wildfire restoration areas.', icon: '🌲' },
  { id: 'r2', name: '100 kg Carbon Offset', partner: 'Gold Standard Carbon', cost: 180, description: 'Retire 100 kg CO2e credits from certified community solar cooker initiatives in Kenya.', icon: '💨' },
  { id: 'r3', name: '15% Off Bamboo Wear', partner: 'EcoThreads Co.', cost: 150, description: 'Redeem for 15% off any organic bamboo clothing order. Organic, vegan, and carbon-neutral.', icon: '👕' },
  { id: 'r4', name: 'Free Eco-Grocery Tote', partner: 'EarthShop', cost: 250, description: 'Claim a heavy-duty reusable canvas grocery bag made from recycled ocean plastics.', icon: '👜' }
];

export const ProfileRewards: React.FC = () => {
  const [badges] = useState<Badge[]>(() => api.getBadges());
  const [coins, setCoins] = useState(() => api.getEcoCoins());
  const [streak] = useState(() => api.getStreak());
  const [redeemedIds, setRedeemedIds] = useState<string[]>([]);

  const handleRedeemReward = (reward: RewardItem) => {
    if (coins < reward.cost) {
      alert("Insufficient Eco-Coins to redeem this reward. Keep logging eco-friendly activities to earn more!");
      return;
    }

    const currentCoins = api.getEcoCoins();
    const newBalance = currentCoins - reward.cost;
    
    // Write back to localstorage via a quick API update
    localStorage.setItem('ecostride_coins', JSON.stringify(newBalance));
    setCoins(newBalance);
    
    setRedeemedIds([...redeemedIds, reward.id]);
    alert(`Successfully redeemed: ${reward.name}! A voucher code has been emailed to you.`);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-slate-800">Profile & Eco Rewards</h2>
        <p className="text-sm text-slate-500 mt-1">Claim your sustainability achievements and redeem rewards</p>
      </div>

      {/* Grid: Stats and Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Eco-Coins Wallet Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl border border-slate-950 shadow-lg flex flex-col justify-between h-48 relative overflow-hidden group hover-scale">
          {/* Subtle gradient light */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full filter blur-xl group-hover:scale-125 transition-transform duration-500"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Available Balance</span>
              <div className="flex items-center space-x-2 mt-1">
                <Coins className="h-6 w-6 text-amber-400" />
                <span className="text-4xl font-black tracking-tight text-white">
                  <AnimatedCount value={coins} />
                </span>
                <span className="text-xs font-bold text-amber-400 uppercase">Coins</span>
              </div>
            </div>
            <div className="p-2.5 bg-slate-800/80 text-amber-400 rounded-xl border border-slate-700/50">
              <Gift className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-t border-slate-800 pt-3">
            <span>Current Streak: <strong>{streak} days</strong> 🔥</span>
            <span className="text-amber-400 flex items-center space-x-0.5">
              <span>Earnings details</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Quick User Summary Cards */}
        <div className="glass-card hover-scale p-5 rounded-2xl flex flex-col justify-between h-48">
          <div>
            <h3 className="text-xs font-bold text-slate-400 tracking-wide uppercase mb-2">Footprint Performance</h3>
            <p className="text-sm font-bold text-slate-700"> Seattle Top 25% Strider </p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Your average weekly emissions are aligned with the Paris Climate Accord boundaries (sub-75 kg).
            </p>
          </div>
          <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-100/50 font-bold text-center">
            🏆 Carbon Diet Level 4
          </div>
        </div>

        <div className="glass-card hover-scale p-5 rounded-2xl flex flex-col justify-between h-48">
          <div>
            <h3 className="text-xs font-bold text-slate-400 tracking-wide uppercase mb-2">Total Offsetting Impact</h3>
            <p className="text-sm font-bold text-slate-700">420 kg CO₂e Offset</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Calculated savings from logs plus redeemed credits have neutralized your residual household footprint.
            </p>
          </div>
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-xl border border-blue-100/50 font-bold text-center">
            🌲 Equivalent to 21 trees planted
          </div>
        </div>
      </div>

      {/* Badges Wall Grid */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase">My Badges Wall</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Badges are unlocked automatically upon logging specific eco achievements</p>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center relative transition-all duration-200 group hover-scale
                ${badge.earned 
                  ? 'badge-glow shadow-sm' 
                  : 'border-slate-200 bg-slate-50/50 opacity-60'}`}
            >
              {/* Badge Icon */}
              <span className={`text-4xl filter mb-2 ${badge.earned ? 'grayscale-0 scale-100' : 'grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-105 transition-all'}`}>
                {badge.icon}
              </span>
              
              <h4 className="text-xs font-bold text-slate-700 truncate w-full">{badge.name}</h4>
              <span className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">
                {badge.earned ? 'Earned' : 'Locked'}
              </span>

              {/* Hover Tooltip for badge description */}
              <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] p-2.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-20 w-44 shadow-lg leading-relaxed border border-slate-800">
                <p className="font-bold text-amber-400">{badge.name}</p>
                <p className="mt-1">{badge.description}</p>
                <p className="text-[9px] text-slate-400 mt-1 border-t border-slate-800 pt-1">Condition: {badge.criteria}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase">Redeem Rewards</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Exchange earned Eco-Coins for verified offset certificates or discounts with green partners</p>
        </div>

        {/* Reward Item Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REWARDS_STORE.map((reward) => {
            const isRedeemed = redeemedIds.includes(reward.id);
            const canAfford = coins >= reward.cost;
            return (
              <div 
                key={reward.id}
                className="flex items-start space-x-4 p-4 rounded-xl border border-slate-100 hover-scale hover:border-slate-200 transition-all duration-150 bg-white/40"
              >
                <div className="text-3xl bg-slate-50 p-3 rounded-xl border border-slate-100/60 shadow-sm flex-shrink-0">
                  {reward.icon}
                </div>
                <div className="flex-grow space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{reward.partner}</h4>
                      <h3 className="text-sm font-bold text-slate-800 mt-0.5">{reward.name}</h3>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg flex-shrink-0">
                      {reward.cost} Coins
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">{reward.description}</p>
                  
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleRedeemReward(reward)}
                      disabled={isRedeemed || !canAfford}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer
                        ${isRedeemed 
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none' 
                          : !canAfford 
                            ? 'bg-slate-50 text-slate-400 border border-slate-150 cursor-not-allowed shadow-none'
                            : 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-900'}`}
                    >
                      {isRedeemed ? 'Redeemed' : 'Redeem Reward'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default ProfileRewards;
