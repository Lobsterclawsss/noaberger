'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface UseScrollAnimationOptions {
  /** 0–1: fraction of element visible before triggering. Default: 0.12 */
  threshold?: number;
  /** Only fire once. Default: true */
  once?: boolean;
}

interface UseScrollAnimationReturn {
  ref: React.RefObject<HTMLElement>;
  isInView: boolean;
}

/**
 * Hook for scroll-triggered animations via GSAP ScrollTrigger.
 * Attach `ref` to any element; `isInView` becomes true when it enters the viewport.
 * Use this when you need scroll-linked logic beyond what ScrollReveal provides.
 *
 * @example
 * const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });
 * return <div ref={ref} className={isInView ? 'visible' : 'hidden'} />;
 */
const useScrollAnimation = ({
  threshold = 0.12,
  once = true,
}: UseScrollAnimationOptions = {}): UseScrollAnimationReturn => {
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const startValue = `top ${Math.round((1 - threshold) * 100)}%`;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: startValue,
      once,
      onEnter: () => setIsInView(true),
      onLeaveBack: once ? undefined : () => setIsInView(false),
    });

    return () => trigger.kill();
  }, [threshold, once]);

  return { ref, isInView };
};

export default useScrollAnimation;
