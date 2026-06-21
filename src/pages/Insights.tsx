import React, { useState } from 'react';
import { api } from '../api';
import type { InsightsData } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Cell, 
  Tooltip 
} from 'recharts';
import { Sparkles, Users, Award, ShieldCheck, ArrowRight } from 'lucide-react';

interface BarTooltipPayload {
  payload: {
    name: string;
  };
  value: number;
}

interface CustomBarTooltipProps {
  active?: boolean;
  payload?: BarTooltipPayload[];
}

const CustomBarTooltip: React.FC<CustomBarTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-800 animate-fade-in">
        <p className="font-semibold">{data.name}</p>
        <p className="mt-1">{payload[0].value} kg CO₂e / week</p>
        {data.name === 'You' ? (
          <p className="text-emerald-400 mt-0.5">Your current weekly average</p>
        ) : data.name === 'Average Citizen' ? (
          <p className="text-slate-400 mt-0.5">Average weekly score in Seattle</p>
        ) : (
          <p className="text-blue-400 mt-0.5">Climate boundary aligned target</p>
        )}
      </div>
    );
  }
  return null;
};

export const Insights: React.FC = () => {
  const [insights] = useState<InsightsData>(() => api.getInsights());
  const [peerData] = useState<{ name: string; emissions: number; fill: string }[]>(() => {
    const data = api.getInsights();
    return [
      { name: 'You', emissions: data.peerComparison.user, fill: '#10b981' },
      { name: 'Average Citizen', emissions: data.peerComparison.average, fill: '#64748b' },
      { name: 'Planetary Target', emissions: 75, fill: '#3b82f6' }
    ];
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">AI Insights & Coaching</h2>
        <p className="text-sm text-slate-500 mt-1">Contextual breakdowns and peer comparison studies</p>
      </div>

      {/* Grid: AI coach card and Comparison chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Center Columns: AI Coach Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between lg:col-span-2 relative overflow-hidden group">
          {/* Subtle gradient pattern background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full filter blur-3xl opacity-60 -mr-20 -mt-20 group-hover:bg-emerald-100 transition-colors duration-500 z-0"></div>
          
          <div className="space-y-4 z-10 relative">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase">AI Carbon Coach</h3>
            </div>
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/80">
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                "{insights.aiCoachMessage}"
              </p>
            </div>

            {/* Tree Equivalency highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/50 flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-lg">🌳</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Annual Offset Equivalency</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{insights.equivalence.description}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100/50 flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg font-bold text-lg">🚗</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Driving Avoided</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    = {Math.round(insights.weeklyTotalCO2 / 0.192)} km of gasoline driving avoided
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 cursor-pointer hover:text-emerald-700 transition-colors z-10 relative">
            <span>Ask AI Coach for deep-dive receipt scan details</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Right Column: Peer Comparison Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Users className="h-5 w-5 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase">Peer Comparison</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">You vs. average user in your city</p>
          </div>

          {/* Bar Chart container */}
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={peerData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar 
                  dataKey="emissions" 
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                >
                  {peerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison conclusion sentence */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500 leading-normal">
            {insights.peerComparison.user < insights.peerComparison.average ? (
              <div className="flex items-start space-x-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                <Award className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>You emit <strong>{Math.round(insights.peerComparison.average - insights.peerComparison.user)} kg CO₂e less</strong> than the average user in your city! Outstanding stride.</span>
              </div>
            ) : (
              <div className="flex items-start space-x-2 text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>You are currently <strong>{Math.round(insights.peerComparison.user - insights.peerComparison.average)} kg CO₂e above</strong> the city average. Log more transit or vegetarian meals to catch up!</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Reduction Tips Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase mb-4">Carbon Action Playbook</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-150">
            <span className="text-2xl">💡</span>
            <h4 className="text-sm font-bold text-slate-800 mt-2">Zero-Waste Cooking</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Plan meals before grocery shopping to limit food waste. Composting organic waste cuts its landfill methane intensity by 80%.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-150">
            <span className="text-2xl">🔋</span>
            <h4 className="text-sm font-bold text-slate-800 mt-2">Phantom Load Reduction</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Unplug chargers and appliances when not in use. Electronics on standby account for up to 10% of household electricity.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-150">
            <span className="text-2xl">🧺</span>
            <h4 className="text-sm font-bold text-slate-800 mt-2">Sustainable Laundry</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Wash full loads of clothes in cold water. Heating water accounts for 90% of a washing machine's total energy footprint.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Insights;
