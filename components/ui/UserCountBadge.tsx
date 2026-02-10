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
      <div className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs tracking-wide duration-300 ease-in-out hover:border-white/15">
        <span className="text-[#FFFFFF80]">Trusted by</span>
        <span
          className="font-semibold tabular-nums"
          style={{ color: "#FF0000" }}
        >
          {formatCount(count)}
        </span>
        <span className="text-[#FFFFFF80]">Users</span>
      </div>
    </div>
  );
}
