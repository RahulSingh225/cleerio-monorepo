'use client';

import React from 'react';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
}

export function CircularProgress({
  value,
  size = 64,
  strokeWidth = 5,
  color = 'var(--primary)',
  bgColor = 'var(--border)',
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="transform rotate-90 origin-center"
          fill="var(--text-primary)"
          fontSize={size * 0.22}
          fontWeight="700"
        >
          {Math.round(value)}%
        </text>
      </svg>
      {label && (
        <span className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}
