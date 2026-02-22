# Animation System — noaberger.com

## Overview

Two layers of animation:

| Layer | Tool | Use case |
|---|---|---|
| Simple fade-in | CSS (`.fade-in`, `.fade-in-1`, etc.) | Hero text, above-the-fold elements |
| Scroll-triggered | GSAP ScrollTrigger | Cards, sections entering viewport |

**Rule:** Use CSS for anything above the fold or that doesn't depend on scroll position. Use GSAP only for scroll-linked animations.

No framer-motion — GSAP only for complex animation.

---

## ScrollReveal Component

**File:** `components/ScrollReveal.tsx`

Wraps any element and fades + slides it into view when it enters the viewport.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | required | Content to animate |
| `delay` | `number` | `0` | Seconds before animation starts |
| `duration` | `number` | `0.7` | Animation duration in seconds |
| `y` | `number` | `30` | Vertical offset in px (slides up from this offset) |
| `className` | `string` | — | Optional class on wrapper div |

### Usage

```tsx
import ScrollReveal from '@/components/ScrollReveal';

// Basic
<ScrollReveal>
  <MyCard />
</ScrollReveal>

// Staggered cards
<div className="grid grid-cols-3 gap-6">
  {cards.map((card, i) => (
    <ScrollReveal key={card.id} delay={i * 0.1} y={40}>
      <Card {...card} />
    </ScrollReveal>
  ))}
</div>

// Custom duration + offset
<ScrollReveal duration={1} y={60} delay={0.3}>
  <HeroImage />
</ScrollReveal>
```

---

## useScrollAnimation Hook

**File:** `hooks/useScrollAnimation.ts`

Lower-level hook when you need `isInView` state for conditional rendering, class toggling, or custom GSAP timelines.

### Returns

| Value | Type | Description |
|---|---|---|
| `ref` | `RefObject<HTMLElement>` | Attach to target element |
| `isInView` | `boolean` | True once element enters viewport |

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `threshold` | `number` | `0.12` | Fraction of element visible before triggering (0–1) |
| `once` | `boolean` | `true` | Only trigger once (stays true after first entry) |

### Usage

```tsx
'use client';
import useScrollAnimation from '@/hooks/useScrollAnimation';

// Toggle a class
const MySection = () => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`transition-opacity duration-700 ${isInView ? 'opacity-100' : 'opacity-0'}`}
    >
      content
    </section>
  );
};

// Custom GSAP timeline driven by isInView
const AnimatedChart = () => {
  const { ref, isInView } = useScrollAnimation();
  const tlRef = useRef<gsap.core.Timeline>();

  useEffect(() => {
    if (isInView && !tlRef.current) {
      tlRef.current = gsap.timeline()
        .from('.bar', { scaleY: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' });
    }
  }, [isInView]);

  return <div ref={ref as React.RefObject<HTMLDivElement>}>...</div>;
};
```

---

## Performance Best Practices

1. **`will-change`** — ScrollReveal sets `will-change: opacity, transform` automatically. Remove it manually on static elements once animation completes if needed.

2. **Cleanup** — Both ScrollReveal and useScrollAnimation clean up ScrollTrigger instances on unmount via `ctx.revert()` / `trigger.kill()`.

3. **`once: true`** — Default for both. Avoids re-triggering on scroll-up, which is almost always the right behavior.

4. **SSR safety** — Both files have `'use client'` directive. Never import them in Server Components.

5. **Don't over-animate** — Cards, section headers, images: yes. Navigation, body text, small icons: no.

6. **Stagger timing** — For grids, `delay={index * 0.1}` feels natural. Beyond `0.15` per item starts feeling slow.

---

## Common Patterns

### Fade-up section header + staggered cards

```tsx
<ScrollReveal>
  <h2 className="text-2xl font-bold mb-8">Section Title</h2>
</ScrollReveal>
<div className="grid md:grid-cols-3 gap-6">
  {items.map((item, i) => (
    <ScrollReveal key={item.id} delay={i * 0.1}>
      <ItemCard {...item} />
    </ScrollReveal>
  ))}
</div>
```

### Hero image reveal (larger y offset, slower)

```tsx
<ScrollReveal y={80} duration={1} delay={0.2}>
  <img src="/hero.jpg" alt="Hero" />
</ScrollReveal>
```

### Conditional content (use hook directly)

```tsx
const { ref, isInView } = useScrollAnimation({ threshold: 0.3 });
// render expensive component only when in view
return <div ref={ref}>{isInView && <HeavyChart />}</div>;
```
