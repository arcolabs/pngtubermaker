"use client";

import { useEffect, useRef, useState } from "react";

const START = 10250;

function formatCount(n: number): string {
  return Math.floor(n).toLocaleString();
}

function getRandomInterval(): number {
  return 8000 + Math.random() * 12000;
}

export function UserCountBadge() {
  const [count, setCount] = useState(START);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      <div className="badge badge-lg badge-outline border-base-content/10 gap-2 px-4 py-3 hover:border-base-content/20 transition-all duration-300">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-error" />
        </span>
        <span className="text-base-content/50">Trusted by</span>
        <span className="font-bold tabular-nums text-base text-error">
          {formatCount(count)}
        </span>
        <span className="text-base-content/50">Users</span>
      </div>
    </div>
  );
}
