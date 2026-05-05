"use client";

import { useEffect, useState } from "react";

export function CountUpWon({
  target,
  duration = 520,
  delayMs = 0,
}: {
  target: number;
  duration?: number;
  /** 이전 연출(예: 별 반짝임) 후 카운트 시작(ms) */
  delayMs?: number;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let animId = 0;

    const run = () => {
      if (cancelled) return;
      if (target === 0) {
        setCurrent(0);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setCurrent(Math.round(eased * target));
        if (t < 1) {
          animId = requestAnimationFrame(tick);
        }
      };
      animId = requestAnimationFrame(tick);
    };

    const timeoutId = window.setTimeout(run, delayMs);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(animId);
    };
  }, [target, duration, delayMs]);

  return <>{current.toLocaleString("ko-KR")}원</>;
}
