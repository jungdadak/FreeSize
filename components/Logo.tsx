import React from 'react';
import Link from 'next/link';

const Logo = () => (
  <Link href="/" className="flex items-center gap-1">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 100"
      className="h-20"
    >
      <defs>
        <linearGradient id="freeGradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#FF7EB3" />
          <stop offset="100%" stopColor="#FFB347" />
        </linearGradient>
        <linearGradient id="sGradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#65C7F7" />
          <stop offset="100%" stopColor="#0052D4" />
        </linearGradient>
        <linearGradient id="izeGradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#34E89E" />
          <stop offset="100%" stopColor="#0F3443" />
        </linearGradient>
      </defs>
      <g>
        {/* FREE text */}
        <text
          x="10%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="start"
          fontSize="40"
          fontFamily="Arial, sans-serif"
          fill="url(#freeGradient)"
        >
          FREE
        </text>

        <text
          x="160"
          y="50%"
          dominantBaseline="middle"
          textAnchor="start"
          fontSize="40"
          fontFamily="Arial, sans-serif"
          fill="url(#izeGradient)"
        >
          SIZE
        </text>
      </g>
    </svg>
  </Link>
);

export default Logo;
