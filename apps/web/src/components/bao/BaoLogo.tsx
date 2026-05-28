interface BaoLogoProps {
  size?: number;
  withSteam?: boolean;
  className?: string;
}

/** Cute steamed-bun logo with a tiny `>_` terminal face. */
export function BaoLogo({ size = 40, withSteam = true, className }: BaoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Bao logo"
    >
      {withSteam && (
        <g
          stroke="var(--bao-bamboo)"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        >
          <path d="M24 12c-2 2 2 4 0 6" />
          <path d="M32 9c-2 2 2 4 0 6" />
          <path d="M40 12c-2 2 2 4 0 6" />
        </g>
      )}
      <ellipse
        cx="32"
        cy="40"
        rx="25"
        ry="19"
        fill="var(--bao-card)"
        stroke="var(--bao-border)"
        strokeWidth="3"
      />
      <path
        d="M16 32c5-7 27-7 32 0"
        fill="none"
        stroke="var(--bao-bamboo)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <text
        x="32"
        y="48"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="15"
        fontWeight="600"
        fill="var(--bao-soy)"
        textAnchor="middle"
      >
        &gt;_
      </text>
    </svg>
  );
}
