import React, { useEffect, useState } from 'react';

interface AnimatedCountProps {
  value: number;
  duration?: number;
  decimals?: number;
}

export const AnimatedCount: React.FC<AnimatedCountProps> = ({ value, duration = 1000, decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;

    if (startValue === endValue) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing: easeOutQuad
      const easedProgress = progress * (2 - progress);
      const current = startValue + easedProgress * (endValue - startValue);
      
      setDisplayValue(current);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    window.requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <>{decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}</>;
};

export default AnimatedCount;
