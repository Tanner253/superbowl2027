import { useId } from "react";

// The $SUPERBOWL badge: a round seal with a football on a floodlit field, the ticker and 2027.
// Drawn by us; brand/render.js draws the same artwork for the PNG logo, icons and banners.
export default function Badge({ size = 48, className = "" }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <path id={`${id}-top`} d="M 38 100 A 62 62 0 0 1 162 100" />
        <path id={`${id}-bot`} d="M 30 100 A 70 70 0 0 0 170 100" />
        <clipPath id={`${id}-disc`}>
          <circle cx="100" cy="100" r="52" />
        </clipPath>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.15" r="0.75">
          <stop offset="0" stopColor="#fff3cf" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff3cf" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="#ffc23d" stroke="#04080f" strokeWidth="4" />
      <circle cx="100" cy="100" r="86" fill="#0c1a2e" stroke="#04080f" strokeWidth="3" />
      <text fontFamily="var(--ff-display), Impact, sans-serif" fontSize="19" letterSpacing="2.4" fill="#ffc23d">
        <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">
          $SUPERBOWL
        </textPath>
      </text>
      <text fontFamily="var(--ff-display), Impact, sans-serif" fontSize="17" letterSpacing="5" fill="#f4f7f2">
        <textPath href={`#${id}-bot`} startOffset="50%" textAnchor="middle" dominantBaseline="hanging">
          2027
        </textPath>
      </text>
      <circle cx="30" cy="100" r="3.2" fill="#ffc23d" />
      <circle cx="170" cy="100" r="3.2" fill="#ffc23d" />
      <circle cx="100" cy="100" r="55" fill="#f4f7f2" stroke="#04080f" strokeWidth="3" />
      <g clipPath={`url(#${id}-disc)`}>
        <rect x="40" y="40" width="120" height="120" fill="#11602f" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={40 + i * 20} y="40" width="10" height="120" fill="#0c4426" opacity="0.55" />
        ))}
        {[64, 82, 100, 118, 136].map((x) => (
          <rect key={x} x={x - 0.8} y="40" width="1.6" height="120" fill="#f4f7f2" opacity="0.5" />
        ))}
        <circle cx="100" cy="100" r="52" fill={`url(#${id}-glow)`} />
      </g>
      <g transform="rotate(-32 100 100)">
        <ellipse cx="102" cy="104" rx="34" ry="20" fill="#04080f" opacity="0.45" />
        <ellipse cx="100" cy="100" rx="34" ry="20" fill="#8a3b12" stroke="#04080f" strokeWidth="3" />
        <path d="M70 100a30 16 0 0 1 60 0" fill="none" stroke="#b25a22" strokeWidth="5" opacity="0.55" />
        <path d="M76 88v24M124 88v24" stroke="#f4f7f2" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M86 100h28" stroke="#f4f7f2" strokeWidth="3" strokeLinecap="round" />
        {[90, 96, 102, 108].map((x) => (
          <path key={x} d={`M${x} 95.5v9`} stroke="#f4f7f2" strokeWidth="2.6" strokeLinecap="round" />
        ))}
      </g>
    </svg>
  );
}
