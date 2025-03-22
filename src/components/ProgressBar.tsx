
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentValue: number;
  maxValue: number;
  className?: string;
  showPercentage?: boolean;
  color?: string;
  height?: number;
}

const ProgressBar = ({
  currentValue,
  maxValue,
  className,
  showPercentage = true,
  color,
  height = 8,
}: ProgressBarProps) => {
  // Calculate percentage, ensuring it's non-negative and capped at 100%
  const percentage = Math.min(Math.max(0, Math.round((currentValue / maxValue) * 100)), 100);
  
  // Dynamic styles based on props
  const progressStyle = {
    width: `${percentage}%`,
    backgroundColor: color || 'hsl(var(--primary))',
    height: `${height}px`,
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="relative w-full overflow-hidden rounded-full bg-secondary">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-in-out"
          style={progressStyle}
        />
      </div>
      {showPercentage && (
        <div className="flex items-center justify-between text-xs font-medium">
          <p>{percentage}%</p>
          <p>{currentValue.toLocaleString()} / {maxValue.toLocaleString()} ₽</p>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
