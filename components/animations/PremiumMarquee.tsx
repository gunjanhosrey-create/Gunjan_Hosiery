'use client';

import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

interface PremiumMarqueeProps {
  texts: string[];
  speed?: number;
  direction?: 'left' | 'right';
}

export default function PremiumMarquee({
  texts,
  speed = 30,
  direction = 'left',
}: PremiumMarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const repeatedTexts = useMemo(() => [...texts, ...texts], [texts]);

  useEffect(() => {
    if (!marqueeRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      const content = contentRef.current!;
      gsap.set(content, { xPercent: 0 });

      const distance = content.offsetWidth / 2;
      const xValue = direction === 'left' ? -distance : distance;

      const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } });
      tl.to(content, {
        x: xValue,
        duration: speed,
      });

      return () => tl.kill();
    }, marqueeRef);

    return () => ctx.revert();
  }, [direction, repeatedTexts, speed]);

  return (
    <div className="overflow-hidden py-4">
      <div ref={marqueeRef} className="relative">
        <div ref={contentRef} className="flex items-center gap-20 whitespace-nowrap text-white text-xl md:text-3xl font-semibold uppercase tracking-[0.28em]">
          {repeatedTexts.map((text, index) => (
            <span key={`${text}-${index}`} className="inline-flex items-center gap-5">
              <span>{text}</span>
              <span className="h-1 w-1 rounded-full bg-gold/70" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
