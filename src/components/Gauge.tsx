import React from 'react';
import AnimatedCount from './AnimatedCount';

interface GaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const Gauge: React.FC<GaugeProps> = ({
  score,
  size = 180,
  strokeWidth = 14
}) => {
  // SVG drawing constants
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  
  // Clamping score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));
  
  // Calculate dash offset to fill the circle matching the score
  // SVG stroke-dashoffset: circumference represents 0%, 0 represents 100%
  const offset = circumference - (clampedScore / 100) * circumference;

  // Determine color matching score range
  const getGaugeColor = (val: number): string => {
    if (val >= 75) return 'stroke-emerald-500'; // Eco Friendly
    if (val >= 50) return 'stroke-amber-500';   // Moderate
    return 'stroke-red-500';                    // High Impact
  };

  const getTextColorClass = (val: number): string => {
    if (val >= 75) return 'text-emerald-600';
    if (val >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getLabel = (val: number): string => {
    if (val >= 75) return 'Excellent';
    if (val >= 50) return 'Moderate';
    return 'Action Needed';
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className="relative" 
        style={{ width: size, height: size }}
        role="meter"
        aria-valuenow={clampedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Sustainability Score Gauge"
      >
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle track */}
          <circle
            className="gauge-track fill-transparent"
            strokeWidth={strokeWidth}
            cx={center}
            cy={center}
            r={radius}
          />
          {/* Foreground animated score bar */}
          <circle
            className={`fill-transparent transition-all duration-1000 ease-out ${getGaugeColor(clampedScore)}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            cx={center}
            cy={center}
            r={radius}
          />
        </svg>
        {/* Core content inside the circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Score</span>
          <span className={`text-4xl font-extrabold tracking-tight ${getTextColorClass(clampedScore)}`}>
            <AnimatedCount value={clampedScore} />
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            / 100
          </span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border
          ${clampedScore >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
            clampedScore >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
            'bg-red-50 text-red-700 border-red-200'}`}
        >
          {getLabel(clampedScore)}
        </span>
      </div>
    </div>
  );
};
export default Gauge;
