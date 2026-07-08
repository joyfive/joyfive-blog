"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  createJandiRecord,
  deleteJandiRecord,
  fetchCompletedByDate,
} from "./actions";
import type { JandiType } from "@/lib/notion/fetchJandiData";

type TransientState = "loading" | "error";

// YYYY-MM-DD 문자열을 캘린더 날짜로 다루기 위해 UTC 기준으로 가감 (한국은 DST 없음)
function shiftDate(dateStr: string, delta: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function formatLabel(dateStr: string): string {
  return new Date(dateStr + "T00:00:00+09:00").toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function JandiLogger({
  types,
  logKey,
  todayKST,
  initialCompleted,
}: {
  types: JandiType[];
  logKey: string;
  todayKST: string;
  initialCompleted: string[];
}) {
  // 선택된 날짜 (기본: 오늘 KST)
  const [selectedDate, setSelectedDate] = useState(todayKST);
  // 날짜별 완료 상태 (서버 초기값 + 탭 후 즉시 추가)
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(initialCompleted)
  );
  // 날짜 이동 시 완료 상태 재조회 로딩
  const [dateLoading, setDateLoading] = useState(false);
  // 일시적 피드백 (loading / error)
  const [transient, setTransient] = useState<Record<string, TransientState>>(
    {}
  );
  const [, startTransition] = useTransition();
  // 초기 마운트에서는 서버가 준 오늘 완료 상태를 그대로 사용 (재조회 skip)
  const skipInitialFetch = useRef(true);

  const isToday = selectedDate === todayKST;
  const canGoNext = selectedDate < todayKST;

  // 날짜 변경 시 해당 날짜의 완료 상태를 다시 불러온다.
  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    let cancelled = false;
    setDateLoading(true);
    fetchCompletedByDate(selectedDate, logKey).then((res) => {
      if (cancelled) return;
      if (res.ok) setCompleted(new Set(res.completed));
      setTransient({});
      setDateLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const goPrev = () => setSelectedDate((d) => shiftDate(d, -1));
  const goNext = () => {
    if (canGoNext) setSelectedDate((d) => shiftDate(d, 1));
  };
  const goToday = () => setSelectedDate(todayKST);

  const clearTransient = (typeName: string) =>
    setTransient((t) => {
      const next = { ...t };
      delete next[typeName];
      return next;
    });

  const handleTap = (typeName: string) => {
    if (dateLoading || transient[typeName] === "loading") return;

    const isDone = completed.has(typeName);
    setTransient((t) => ({ ...t, [typeName]: "loading" }));

    const dateForAction = selectedDate;
    startTransition(async () => {
      // 완료 상태면 토글 삭제, 아니면 기록 추가
      const result = isDone
        ? await deleteJandiRecord(typeName, logKey, dateForAction)
        : await createJandiRecord(typeName, logKey, dateForAction);

      // 응답 도착 사이 날짜가 바뀌었으면 UI 반영하지 않음
      if (dateForAction !== selectedDate) return;

      if (result.ok) {
        setCompleted((c) => {
          const next = new Set(c);
          if (isDone) next.delete(typeName);
          else next.add(typeName);
          return next;
        });
        clearTransient(typeName);
      } else {
        setTransient((t) => ({ ...t, [typeName]: "error" }));
        setTimeout(() => clearTransient(typeName), 2500);
      }
    });
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-10 pb-28 flex flex-col gap-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="font-orbit text-2xl font-bold text-stone-800 mb-3">
          잔디 기록
        </h1>

        {/* 날짜 네비게이션 */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={goPrev}
            aria-label="이전 날짜"
            className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-800 active:scale-90 transition-all"
          >
            ‹
          </button>
          <p className="text-sm text-stone-500 min-w-[10rem] tabular-nums">
            {formatLabel(selectedDate)}
          </p>
          <button
            onClick={goNext}
            disabled={!canGoNext}
            aria-label="다음 날짜"
            className={`w-8 h-8 flex items-center justify-center transition-all ${
              canGoNext
                ? "text-stone-500 hover:text-stone-800 active:scale-90"
                : "text-stone-200 cursor-default"
            }`}
          >
            ›
          </button>
        </div>

        {!isToday && (
          <button
            onClick={goToday}
            className="mt-2 text-xs text-stone-400 hover:text-stone-700 underline underline-offset-2"
          >
            오늘로 이동
          </button>
        )}
      </div>

      {/* 버튼 그리드 */}
      <div
        className={`grid grid-cols-2 gap-4 transition-opacity ${
          dateLoading ? "opacity-50" : ""
        }`}
      >
        {types.map((type) => {
          const isDone = completed.has(type.name);
          const isLoading = transient[type.name] === "loading";
          const isError = transient[type.name] === "error";

          return (
            <button
              key={type.id}
              onClick={() => handleTap(type.name)}
              disabled={isLoading || dateLoading}
              title={isDone ? "다시 눌러 기록 취소" : undefined}
              className={`
                relative flex flex-col items-center justify-center
                min-h-[100px] px-4 py-5 rounded-none
                text-base font-semibold transition-all
                ${!isError ? "active:scale-95" : ""}
                ${isDone ? "bg-stone-800 text-white" : "bg-white text-stone-700"}
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

              {isLoading ? (
                <span className="relative text-xs mt-1 font-normal opacity-60">
                  {isDone ? "취소 중..." : "기록 중..."}
                </span>
              ) : isError ? (
                <span className="relative text-xs mt-1 font-normal">
                  실패했어요
                </span>
              ) : isDone ? (
                <span className="relative text-xs mt-1 font-normal opacity-70">
                  완료 ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
