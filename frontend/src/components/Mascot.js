import React from "react";

/**
 * Original SVG mascot for ConsentClear — a small shield character
 * ("Sentry") holding a red flag, built from the app's existing brand
 * colors (blue gradient body, red accent flag). No external assets,
 * so there's nothing to license or attribute.
 *
 * Swap this out any time for a commissioned/AI-generated character —
 * this component is the only place that needs to change.
 */
export default function Mascot({ size = 28, style, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={style}
    >
      <defs>
        <linearGradient id="mascotBody" x1="4" y1="2" x2="60" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5ea1ff" />
          <stop offset="0.6" stopColor="#3355c4" />
          <stop offset="1" stopColor="#1c2a5e" />
        </linearGradient>
      </defs>

      {/* shield body */}
      <path
        d="M32 3 L57 12 V29 C57 45.5 47 56.5 32 61 C17 56.5 7 45.5 7 29 V12 Z"
        fill="url(#mascotBody)"
      />

      {/* little flag tucked at the shoulder */}
      <rect x="45.5" y="13" width="2" height="10" rx="1" fill="#0f1830" />
      <path d="M47.5 14 L55.5 17 L47.5 20 Z" fill="#e8433a" />

      {/* eyes */}
      <circle cx="24" cy="29" r="6.2" fill="#fff" />
      <circle cx="40" cy="29" r="6.2" fill="#fff" />
      <circle cx="25.4" cy="30.2" r="2.7" fill="#111633" />
      <circle cx="41.4" cy="30.2" r="2.7" fill="#111633" />

      {/* smile */}
      <path
        d="M23 41.5 Q32 48.5 41 41.5"
        stroke="#fff"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
