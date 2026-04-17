import { useEffect, useRef } from 'react';

import gsap from 'gsap';

import { bindLogoHoverBounce, startLogoLetterLoop } from '../lib/logoAnimations';

const SIZE_MAP = {
  sm: {
    icon: 22,
    textClassName: 'text-lg',
    gapClassName: 'gap-2',
  },
  md: {
    icon: 28,
    textClassName: 'text-xl',
    gapClassName: 'gap-2',
  },
  lg: {
    icon: 32,
    textClassName: 'text-2xl',
    gapClassName: 'gap-2.5',
  },
} as const;

type LogoSize = keyof typeof SIZE_MAP;

export default function Logo({ animated = true, size = 'md', className = '' }: { animated?: boolean; size?: LogoSize; className?: string }) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const config = SIZE_MAP[size] ?? SIZE_MAP.md;

  useEffect(() => {
    if (!animated) {
      return undefined;
    }

    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const lettersContainer = root.querySelector('[data-logo-letters]');
      const stopLoop = startLogoLetterLoop(lettersContainer);
      const stopHover = bindLogoHoverBounce(root, lettersContainer);

      return () => {
        stopHover();
        stopLoop();
      };
    }, root);

    return () => ctx.revert();
  }, [animated]);

  return (
    <span ref={rootRef} className={`group inline-flex select-none items-center ${config.gapClassName} ${className}`}>
      <svg
        className="shrink-0"
        fill="none"
        height={config.icon}
        viewBox="0 0 28 28"
        width={config.icon}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="14" cy="14" fill="#00288e" opacity="0.08" r="13" />
        <path d="M10 14.5C10 12.567 11.567 11 13.5 11H15.5C17.433 11 19 12.567 19 14.5C19 16.433 17.433 18 15.5 18H14.5" stroke="#00288e" strokeLinecap="round" strokeWidth="2" />
        <path d="M18 13.5C18 11.567 16.433 10 14.5 10H12.5C10.567 10 9 11.567 9 13.5C9 15.433 10.567 17 12.5 17H13.5" stroke="#4648d4" strokeLinecap="round" strokeWidth="2" />
        <circle cx="21" cy="7" fill="#4648d4" r="1.5" />
        <circle cx="7" cy="21" fill="#00288e" opacity="0.5" r="1" />
        <circle cx="23" cy="11" fill="#4648d4" opacity="0.6" r="0.8" />
      </svg>

      <span className={`${config.textClassName} font-bold text-blue-800`}>Inter</span>
      <span className="logo-animated" data-logo-letters="">
        {['L', 'i', 'n', 'k'].map((letter) => (
          <span className={`${config.textClassName} logo-letter font-bold text-indigo-600`} data-char={letter} key={letter}>
            {letter}
          </span>
        ))}
      </span>
    </span>
  );
}
