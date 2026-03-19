"use client";

import { useState, useTransition } from "react";
import { createJandiRecord } from "./actions";
import type { JandiType } from "@/lib/notion/fetchJandiData";

type TransientState = "loading" | "error";

export default function JandiLogger({
  types,
  logKey,
  todayLabel,
  initialCompleted,
}: {
  types: JandiType[];
  logKey: string;
  todayLabel: string;
  initialCompleted: string[];
}) {
  // 영구 완료 상태 (서버 초기값 + 탭 후 즉시 추가)
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(initialCompleted)
  );
  // 일시적 피드백 (loading / error)
  const [transient, setTransient] = useState<Record<string, TransientState>>(
    {}
  );
  const [, startTransition] = useTransition();

  const handleTap = (typeName: string) => {
    if (completed.has(typeName) || transient[typeName] === "loading") return;

    setTransient((t) => ({ ...t, [typeName]: "loading" }));

    startTransition(async () => {
      const result = await createJandiRecord(typeName, logKey);
      if (result.ok) {
        setCompleted((c) => new Set([...c, typeName]));
        setTransient((t) => {
          const next = { ...t };
          delete next[typeName];
          return next;
        });
      } else {
        setTransient((t) => ({ ...t, [typeName]: "error" }));
        setTimeout(() => {
          setTransient((t) => {
            const next = { ...t };
            delete next[typeName];
            return next;
          });
        }, 2500);
      }
    });
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-10 flex flex-col gap-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="font-orbit text-2xl font-bold text-stone-800 mb-1">
          잔디 기록
        </h1>
        <p className="text-sm text-stone-400">{todayLabel}</p>
      </div>

      {/* 버튼 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        {types.map((type) => {
          const isDone = completed.has(type.name);
          const isLoading = transient[type.name] === "loading";
          const isError = transient[type.name] === "error";

          return (
            <button
              key={type.id}
              onClick={() => handleTap(type.name)}
              disabled={isDone || isLoading}
              className={`
                relative flex flex-col items-center justify-center
                min-h-[100px] px-4 py-5 rounded-none
                text-base font-semibold transition-all
                ${!isDone && !isError ? "active:scale-95" : ""}
                ${isDone ? "bg-stone-800 text-white cursor-default" : "bg-white text-stone-700"}
                ${isError ? "bg-red-50 text-red-500" : ""}
                ${isLoading ? "opacity-60" : ""}
              `}
            >
              {/* rough border */}
              <span
                className={`absolute inset-0 filter-rough pointer-events-none border ${
                  isDone ? "border-stone-800" : "border-stone-300"
                }`}
                aria-hidden="true"
              />

              {/* 마스킹테이프 (미완료 상태만) */}
              {!isDone && !isError && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-2.5 bg-stone-200/80 filter-rough"
                  aria-hidden="true"
                />
              )}

              <span className="relative text-lg">{type.name}</span>

              {isDone && (
                <span className="relative text-xs mt-1 font-normal opacity-70">
                  완료 ✓
                </span>
              )}
              {isLoading && (
                <span className="relative text-xs mt-1 font-normal opacity-60">
                  기록 중...
                </span>
              )}
              {isError && (
                <span className="relative text-xs mt-1 font-normal">
                  실패했어요
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
