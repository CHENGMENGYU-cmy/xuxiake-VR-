'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

function Slider({
  value = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled = false,
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange?.([Number(e.target.value)]);
  };

  return (
    <input
      type="range"
      value={value[0]}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={cn(
        'h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary',
        '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    />
  );
}

export { Slider };
export type { SliderProps };
