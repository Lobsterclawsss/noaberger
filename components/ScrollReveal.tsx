'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
}

/**
 * ScrollReveal — fades + slides children into view on scroll.
 * Uses GSAP ScrollTrigger. For simple fade-ins, use CSS `.fade-in` instead.
 *
 * @example
 * <ScrollReveal delay={0.2} y={40}>
 *   <MyCard />
 * </ScrollReveal>
 */
const ScrollReveal = ({
  children,
  delay = 0,
  duration = 0.7,
  y = 30,
  className,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [delay, duration, y]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'opacity, transform' }}>
      {children}
    </div>
  );
};

export default ScrollReveal;
