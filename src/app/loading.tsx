"use client";

import { useEffect, useState } from "react";

const TEXT = "오늘의 기쁨을 불러오는 중입니다.";
const CHAR_DELAY = 80; // ms per character

export default function Loading() {
  const [filledCount, setFilledCount] = useState(0);
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    TEXT.split("").forEach((_, i) => {
      timers.push(setTimeout(() => setFilledCount(i + 1), i * CHAR_DELAY));
    });

    const textDone = TEXT.length * CHAR_DELAY;

    timers.push(setTimeout(() => setShowCursor(true), textDone));
    timers.push(setTimeout(() => setShowCursor(false), textDone + 1500));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8">
      <img src="/icon-256.png" alt="오늘의 기쁨" width={64} height={64} />
      <p className="text-sm tracking-wide">
        {TEXT.split("").map((char, i) => (
          <span
            key={i}
            className={i < filledCount ? "text-stone-700" : "text-stone-400"}
          >
            {char}
          </span>
        ))}
        {showCursor && (
          <span className="text-stone-700 animate-blink">|</span>
        )}
      </p>
    </div>
  );
}
