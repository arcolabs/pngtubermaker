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
      <div className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-wide duration-300 ease-in-out hover:border-white/20 hover:bg-white/10 shadow-[inset_0_0_16px_rgba(240,247,245,0.1)] hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.15)] transition-all">
        {/* Live indicator */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0033] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF0033]"></span>
        </span>
        <span className="text-[#FFFFFF80]">Trusted by</span>
        <span
          className="font-bold tabular-nums text-base"
          style={{ color: "#FF0000" }}
        >
          {formatCount(count)}
        </span>
        <span className="text-[#FFFFFF80]">Users</span>
      </div>
    </div>
  );
}
