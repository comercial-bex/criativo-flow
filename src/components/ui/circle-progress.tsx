import * as React from "react";
import { useState, useEffect, useRef } from "react";

interface CircleProgressProps {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  getColor?: (fillPercentage: number) => string;
  className?: string;
  animationDuration?: number;
  disableAnimation?: boolean;
}

export const CircleProgress = ({
  value,
  maxValue,
  size = 40,
  strokeWidth = 3,
  getColor,
  className = "",
  animationDuration = 300,
  disableAnimation = false,
}: CircleProgressProps) => {
  const [animatedValue, setAnimatedValue] = useState(disableAnimation ? value : 0);
  const animatedValueRef = useRef(animatedValue);

  useEffect(() => {
    animatedValueRef.current = animatedValue;
  }, [animatedValue]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillPercentage = Math.min(animatedValue / maxValue, 1);
  const strokeDashoffset = circumference * (1 - fillPercentage);

  const defaultGetColor = (percentage: number) => {
    if (percentage < 0.7) return "stroke-bex";
    if (percentage < 0.9) return "stroke-amber-500";
    return "stroke-red-500";
  };

  const currentColor = getColor ? getColor(fillPercentage) : defaultGetColor(fillPercentage);

  useEffect(() => {
    if (disableAnimation) {
      setAnimatedValue(value);
      return;
    }

    const start = animatedValueRef.current;
    const end = Math.min(value, maxValue);
    const startTime = performance.now();

    if (start === end) return;

    const animateProgress = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const currentValue = start + (end - start) * easeProgress;

      setAnimatedValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      }
    };

    const animationFrame = requestAnimationFrame(animateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, maxValue, animationDuration, disableAnimation]);

  return (
    <div className={className}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="duration-300">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-transparent stroke-gray-200 dark:stroke-gray-700"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`fill-transparent transition-colors ${currentColor}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
