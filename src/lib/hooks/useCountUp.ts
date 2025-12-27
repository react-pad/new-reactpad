import { useEffect, useState, useRef } from 'react';

const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export function useCountUp(to: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);
  const startTime = useRef<number | undefined>(undefined);
  const hasAnimated = useRef(false);

  const animate = (timestamp: number) => {
    if (startTime.current === undefined) {
      startTime.current = timestamp;
    }
    const elapsed = timestamp - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutExpo(progress);
    const newCount = easedProgress * to;

    setCount(newCount);

    if (progress < 1) {
      animationFrameId.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animationFrameId.current = requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [to, duration]);

  return { count, ref };
}
