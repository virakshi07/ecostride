import React, { useState } from 'react';
import { api } from '../api';
import Gauge from '../components/Gauge';
import AnimatedCount from '../components/AnimatedCount';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { ArrowDown, ArrowUp, Calendar, Zap, Car, Leaf, Trash2, ShoppingBag } from 'lucide-react';

interface TooltipPayload {
  payload: {
    label: string;
    value: number;
  };
  value: number;
}

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const CustomPieTooltip: React.FC<CustomPieTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-800">
        <p className="font-semibold">{data.label}</p>
        <p className="mt-1">{data.value} kg CO₂e</p>
        <p className="text-slate-400 mt-0.5">= {Math.round(data.value / 0.192)} km driven</p>
      </div>
    );
  }
  return null;
};

interface LineTooltipPayload {
  payload: {
    week: string;
    target: number;
  };
  value: number;
}

interface CustomLineTooltipProps {
  active?: boolean;
  payload?: LineTooltipPayload[];
}

const CustomLineTooltip: React.FC<CustomLineTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-800">
        <p className="font-semibold text-slate-400">{payload[0].payload.week}</p>
        <p className="mt-1 text-emerald-400">Emissions: {payload[0].value} kg CO₂e</p>
        <p className="text-slate-400 mt-0.5">Target: {payload[0].payload.target} kg CO₂e</p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC = () => {
  const [score] = useState(() => api.getSustainabilityScore());
  const [categoryData] = useState(() => api.getEmissionsByCategory());
  const [trendData] = useState(() => api.getHistoricalTrend());
  const [weeklyTotal] = useState(() => api.getInsights().weeklyTotalCO2);
  const [weeklyChange] = useState(() => api.getInsights().weeklyChange);

  // Map category key to Lucide Icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport': return <Car className="h-5 w-5 text-blue-500" />;
      case 'energy': return <Zap className="h-5 w-5 text-amber-500" />;
      case 'food': return <Leaf className="h-5 w-5 text-emerald-500" />;
      case 'shopping': return <ShoppingBag className="h-5 w-5 text-violet-500" />;
      case 'waste': return <Trash2 className="h-5 w-5 text-red-500" />;
      default: return <Leaf className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center glass-card p-6 rounded-2xl gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Eco Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time footprint tracking & carbon insights</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Week 8 (June 21 - June 27)</span>
        </div>
      </div>

      {/* Grid: Gauge Score and General KPI Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Gauge Widget */}
        <div className="glass-card hover-scale p-6 rounded-2xl flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase mb-4">Sustainability Score</h3>
          <Gauge score={score} />
        </div>

        {/* Footprint KPI card */}
        <div className="glass-card hover-scale p-6 rounded-2xl flex flex-col justify-between md:col-span-2">
          <div>
            <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase mb-3">Weekly Carbon Footprint</h3>
            <div className="flex items-baseline space-x-3">
              <span className="text-5xl font-black tracking-tight text-slate-800">
                <AnimatedCount value={weeklyTotal} decimals={1} />
              </span>
              <span className="text-base font-semibold text-slate-500">kg CO₂e</span>
            </div>
            
            {/* Weekly Comparison */}
            <div className="flex items-center space-x-2 mt-4">
              {weeklyChange < 0 ? (
                <div className="inline-flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-100">
                  <ArrowDown className="h-3.5 w-3.5" />
                  <span>{Math.abs(weeklyChange)}%</span>
                </div>
              ) : weeklyChange > 0 ? (
                <div className="inline-flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold border border-red-100">
                  <ArrowUp className="h-3.5 w-3.5" />
                  <span>{weeklyChange}%</span>
                </div>
              ) : (
                <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  No change
                </div>
              )}
              <span className="text-xs text-slate-500 font-medium">compared to last week (75.0 kg target)</span>
            </div>
          </div>

          {/* Equivalence display */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Equivalent Impact</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">
                = {Math.round(weeklyTotal / 20)} mature trees offset equivalent
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category breakdown (donut chart) */}
        <div className="glass-card hover-scale p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase mb-1">Emissions by Category</h3>
            <p className="text-xs text-slate-500 mb-4">Emissions share in current week</p>
          </div>
          
          <div className="h-60 w-full flex items-center justify-center">
            {categoryData.some(cat => cat.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={10} 
                    iconType="circle"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(_value, entry: any) => {
                      const item = entry.payload;
                      if (!item) return '';
                      return <span className="text-xs font-semibold text-slate-600">{item.label} ({item.value} kg)</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-sm font-medium">
                No emissions logged yet this week. Use the Log Activity tab to record emissions!
              </div>
            )}
          </div>
        </div>

        {/* Historical trend (line chart) */}
        <div className="glass-card hover-scale p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase mb-1">8-Week Emissions Trend</h3>
            <p className="text-xs text-slate-500 mb-4">Historical weekly footprint with target overlay</p>
          </div>
          
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="week" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <ReferenceLine 
                  y={75} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5}
                />
                <Line 
                  type="monotone" 
                  dataKey="emissions" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Actions and Category list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Details Table/Cards */}
        <div className="glass-card hover-scale p-6 rounded-2xl md:col-span-1">
          <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase mb-4">Log Quick Stats</h3>
          <div className="space-y-3">
            {categoryData.map((cat) => (
              <div 
                key={cat.category}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors duration-150"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200/60 shadow-sm">
                    {getCategoryIcon(cat.category)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 capitalize">{cat.category}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Category</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800">{cat.value}</div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">kg CO₂e</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Actions Card */}
        <div className="glass-card hover-scale p-6 rounded-2xl md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase mb-1">Recommended Actions</h3>
            <p className="text-xs text-slate-500 mb-4">Tailored reductions based on your footprint profile</p>
          </div>
          
          <div className="space-y-4">
            {/* Action 1 */}
            <div className="flex items-start space-x-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-200 group">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors duration-200">
                <Car className="h-5 w-5" />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-bold text-slate-800">Commute by Train or Bus</h4>
                <p className="text-xs text-slate-500 mt-1">Replace one 20km car trip with train or bus travel to cut transport carbon by 60%.</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Save ~3.2 kg CO₂e
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    = 0.2 trees planted
                  </span>
                </div>
              </div>
            </div>

            {/* Action 2 */}
            <div className="flex items-start space-x-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-200 group">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors duration-200">
                <Leaf className="h-5 w-5" />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-bold text-slate-800">Choose Poultry or Plant Food</h4>
                <p className="text-xs text-slate-500 mt-1">Swap 1kg of beef or lamb for chicken or vegetarian food in your weekly meals.</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Save ~20.1 kg CO₂e
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    = 1 tree planted
                  </span>
                </div>
              </div>
            </div>

            {/* Action 3 */}
            <div className="flex items-start space-x-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-200 group">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-100 transition-colors duration-200">
                <Zap className="h-5 w-5" />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-bold text-slate-800">Cool/Heat Eco-settings</h4>
                <p className="text-xs text-slate-500 mt-1">Adjust thermostat by 2°C or run washing machine on eco mode (cold wash).</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Save ~4.8 kg CO₂e
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    = 0.25 trees planted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
