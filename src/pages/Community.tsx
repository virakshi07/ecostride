import React, { useState } from 'react';
import { api } from '../api';
import type { LeaderboardEntry, Challenge } from '../types';
import { Trophy, Users, Globe, Play, CheckCircle } from 'lucide-react';

export const Community: React.FC = () => {
  const [leaderboardTab, setLeaderboardTab] = useState<'city' | 'friends' | 'cohort'>('city');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => api.getLeaderboard('city'));
  const [challenges, setChallenges] = useState<Challenge[]>(() => api.getChallenges());

  const handleTabChange = (tab: 'city' | 'friends' | 'cohort') => {
    setLeaderboardTab(tab);
    setLeaderboard(api.getLeaderboard(tab));
  };

  const handleJoinChallenge = (id: string) => {
    const updated = api.joinChallenge(id);
    setChallenges(updated);
    
    // Also refresh leaderboard since joining might affect the score (though score is based on emissions, coins and badges)
    setLeaderboard(api.getLeaderboard(leaderboardTab));
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">EcoStride Community</h2>
        <p className="text-sm text-slate-500 mt-1">Participate in sustainability challenges and climb the leaderboards</p>
      </div>

      {/* Challenges Section - Horizontal Carousel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase">Active Group Challenges</h3>
            <p className="text-xs text-slate-500 mt-0.5">Opt-in to micro-challenges to earn bonus Eco-Coins</p>
          </div>
        </div>

        {/* Horizontal Scroll Carousel */}
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
          {challenges.map((ch) => (
            <div 
              key={ch.id}
              className={`flex-shrink-0 w-80 p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between
                ${ch.joined 
                  ? 'border-emerald-200 bg-emerald-50/15 shadow-sm' 
                  : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider
                    ${ch.category === 'transport' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      ch.category === 'energy' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      ch.category === 'food' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      ch.category === 'shopping' ? 'bg-violet-50 text-violet-700 border-violet-100' :
                      'bg-red-50 text-red-700 border-red-100'}`}
                  >
                    {ch.category}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">{ch.duration}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 tracking-wide">{ch.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ch.description}</p>
                </div>
              </div>

              {/* Progress or Join Action */}
              <div className="mt-6 pt-4 border-t border-slate-100/80">
                {ch.joined ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">Progress</span>
                      <span className={ch.progress === 100 ? "text-emerald-600" : "text-slate-700"}>
                        {ch.progress}%
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500
                          ${ch.progress === 100 ? 'bg-emerald-500' : 'bg-brand-green'}`}
                        style={{ width: `${ch.progress}%` }}
                      ></div>
                    </div>
                    {ch.progress === 100 ? (
                      <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-bold justify-center pt-1 bg-emerald-50 py-1 rounded-lg">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completed! (+{ch.points} Coins)</span>
                      </div>
                    ) : (
                      <span className="block text-[10px] text-slate-400 font-bold text-center pt-1">
                        Target: {ch.target}
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoinChallenge(ch.id)}
                    className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>Join Challenge (+{ch.points} pts)</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboards Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase">Leaderboards</h3>
          <p className="text-xs text-slate-500 mt-0.5">Climb ranks by improving your weekly Sustainability Score</p>
        </div>

        {/* Tab Headers */}
        <div className="flex space-x-2 border-b border-slate-100 pb-2">
          {([
            { id: 'city', label: 'Seattle City', icon: <Globe className="h-4 w-4" /> },
            { id: 'friends', label: 'Friends Circle', icon: <Users className="h-4 w-4" /> },
            { id: 'cohort', label: 'My Cohort', icon: <Trophy className="h-4 w-4" /> }
          ] as const).map(tab => {
            const isActive = leaderboardTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer
                  ${isActive 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4 text-right">Sustainability Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user) => (
                <tr 
                  key={user.username}
                  className={`border-b border-slate-100/60 text-sm transition-colors duration-150
                    ${user.isCurrentUser ? 'bg-emerald-50/20 font-bold border-l-4 border-l-emerald-500' : 'hover:bg-slate-50/50'}`}
                >
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                      ${user.rank === 1 ? 'bg-amber-100 text-amber-800' :
                        user.rank === 2 ? 'bg-slate-100 text-slate-800' :
                        user.rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'text-slate-500'}`}>
                      {user.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex items-center space-x-3">
                    <span className="text-lg">{user.avatar || '🚶'}</span>
                    <span className="text-slate-700">{user.username}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-800">
                    {user.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Community;
