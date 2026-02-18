"use client";

import { useEffect, useRef, useState } from "react";

const START = 1000;

function formatCount(n: number): string {
  return Math.floor(n).toLocaleString();
}

function getRandomInterval(): number {
  return 8000 + Math.random() * 12000;
}

export function UserCountBadge() {
  const [count, setCount] = useState(START);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scheduleNextIncrement = () => {
      const delay = getRandomInterval();
      timeoutRef.current = setTimeout(() => {
        setCount((prev) => prev + 1);
        scheduleNextIncrement();
      }, delay);
    };

    scheduleNextIncrement();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="mb-6 inline-flex items-center justify-center">
      <div className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs tracking-wide duration-300 ease-in-out hover:border-primary/30 hover:shadow-[0_0_16px_rgba(6,182,212,0.15)] transition-all shadow-sm">
        {/* Live indicator - Theme color */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="text-gray-600">Trusted by</span>
        <span className="font-bold tabular-nums text-base text-primary">
          {formatCount(count)}
        </span>
        <span className="text-gray-600">Users</span>
      </div>
    </div>
  );
}
