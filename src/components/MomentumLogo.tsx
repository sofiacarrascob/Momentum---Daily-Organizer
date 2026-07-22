/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useId } from 'react';

interface MomentumLogoProps {
  className?: string;
  size?: number;
}

export const MomentumLogo: React.FC<MomentumLogoProps> = ({ className = '', size = 32 }) => {
  const rawId = useId();
  const idPrefix = `mLogo-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  const petalGradId = `${idPrefix}-petalGrad`;
  const centerGradId = `${idPrefix}-centerGrad`;
  const highlightGradId = `${idPrefix}-highlightGrad`;
  const shadowId = `${idPrefix}-softShadow`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      className={`select-none flex-shrink-0 ${className}`}
      aria-label="Momentum Flower Icon"
    >
      <defs>
        {/* Main Petal Gradient */}
        <linearGradient id={petalGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7D32" />
          <stop offset="60%" stopColor="#EF681E" />
          <stop offset="100%" stopColor="#D8540E" />
        </linearGradient>

        {/* Center Disk Gradient */}
        <linearGradient id={centerGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3D1A10" />
          <stop offset="100%" stopColor="#270B04" />
        </linearGradient>

        {/* Subtle Petal Highlight Gradient */}
        <linearGradient id={highlightGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>

        {/* Soft Drop Shadow for Depth */}
        <filter id={shadowId} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#301208" floodOpacity="0.18" />
        </filter>
      </defs>

      <g filter={`url(#${shadowId})`}>
        {/* 6 Organic Petals overlapping seamlessly at center with zero gaps */}
        {/* Petal 1 (Top) */}
        <g transform="rotate(0 50 50)">
          <path
            d="M 50 8 C 36 8 34 30 42 46 C 47 52 53 52 58 46 C 66 30 64 8 50 8 Z"
            fill={`url(#${petalGradId})`}
          />
          <path
            d="M 48 11 C 41 13 39 26 44 36 C 45.5 33 48 18 52 12 C 50.5 11.2 49.2 11 48 11 Z"
            fill={`url(#${highlightGradId})`}
          />
        </g>

        {/* Petal 2 (60 deg) */}
        <g transform="rotate(60 50 50)">
          <path
            d="M 50 8 C 35 8 34 30 42 46 C 47 52 53 52 58 46 C 66 30 65 8 50 8 Z"
            fill={`url(#${petalGradId})`}
          />
          <path
            d="M 48 11 C 41 13 39 26 44 36 C 45.5 33 48 18 52 12 C 45.5 33 48 18 52 12 C 50.5 11.2 49.2 11 48 11 Z"
            fill={`url(#${highlightGradId})`}
          />
        </g>

        {/* Petal 3 (120 deg) */}
        <g transform="rotate(120 50 50)">
          <path
            d="M 50 8 C 36 8 34 30 42 46 C 47 52 53 52 58 46 C 66 30 64 8 50 8 Z"
            fill={`url(#${petalGradId})`}
          />
          <path
            d="M 48 11 C 41 13 39 26 44 36 C 45.5 33 48 18 52 12 C 50.5 11.2 49.2 11 48 11 Z"
            fill={`url(#${highlightGradId})`}
          />
        </g>

        {/* Petal 4 (180 deg) */}
        <g transform="rotate(180 50 50)">
          <path
            d="M 50 8 C 35 8 34 30 42 46 C 47 52 53 52 58 46 C 66 30 65 8 50 8 Z"
            fill={`url(#${petalGradId})`}
          />
          <path
            d="M 48 11 C 41 13 39 26 44 36 C 45.5 33 48 18 52 12 C 50.5 11.2 49.2 11 48 11 Z"
            fill={`url(#${highlightGradId})`}
          />
        </g>

        {/* Petal 5 (240 deg) */}
        <g transform="rotate(240 50 50)">
          <path
            d="M 50 8 C 36 8 34 30 42 46 C 47 52 53 52 58 46 C 66 30 64 8 50 8 Z"
            fill={`url(#${petalGradId})`}
          />
          <path
            d="M 48 11 C 41 13 39 26 44 36 C 45.5 33 48 18 52 12 C 50.5 11.2 49.2 11 48 11 Z"
            fill={`url(#${highlightGradId})`}
          />
        </g>

        {/* Petal 6 (300 deg) */}
        <g transform="rotate(300 50 50)">
          <path
            d="M 50 8 C 35 8 34 30 42 46 C 47 52 53 52 58 46 C 66 30 65 8 50 8 Z"
            fill={`url(#${petalGradId})`}
          />
          <path
            d="M 48 11 C 41 13 39 26 44 36 C 45.5 33 48 18 52 12 C 50.5 11.2 49.2 11 48 11 Z"
            fill={`url(#${highlightGradId})`}
          />
        </g>

        {/* Dark Brown Center Disc (Rounded organic circle) */}
        <path
          d="M 50 31 C 60.8 31 69 39.2 69 50 C 69 60.8 60.5 69 50 69 C 39.2 69 31 60.5 31 50 C 31 39.2 39.2 31 50 31 Z"
          fill={`url(#${centerGradId})`}
        />

        {/* Clean white checkmark centered vertically & horizontally */}
        <path
          d="M 41.5 50.2 L 47.2 56 L 58.5 43.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
