"use client";

import { useEffect, useRef, useState } from "react";
import { annotate } from "rough-notation";
import type { HeadingItem } from "@/lib/utils/toc";

export type { HeadingItem };

function TitleUnderline() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ann = annotate(ref.current, {
      type: "underline",
      animate: false,
      color: "#78716c",
      strokeWidth: 1.5,
      padding: 2,
    });
    ann.show();
    return () => ann.remove();
  }, []);
  return (
    <span ref={ref} className="text-xs font-bold text-stone-400 uppercase tracking-widest">
      목차
    </span>
  );
}

function TOCList({
  headings,
  activeId,
  onClickItem,
}: {
  headings: HeadingItem[];
  activeId: string | null;
  onClickItem?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-1.5 mt-4">
      {headings.map((h) => (
        <li
          key={h.id}
          style={{
            paddingLeft: h.level === 1 ? 0 : h.level === 2 ? "0.75rem" : "1.5rem",
          }}
        >
          <a
            href={`#${h.id}`}
            onClick={onClickItem}
            className={`block text-xs leading-relaxed transition-colors hover:text-stone-700 ${
              activeId === h.id
                ? "text-stone-700 font-semibold"
                : "text-stone-400"
            }`}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

function useActiveHeading(headings: HeadingItem[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}

export function DesktopTOC({ headings }: { headings: HeadingItem[] }) {
  const activeId = useActiveHeading(headings);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden lg:block w-48 shrink-0 self-start sticky top-24">
      <TitleUnderline />
      <TOCList headings={headings} activeId={activeId} />
    </aside>
  );
}

export function MobileTOC({ headings }: { headings: HeadingItem[] }) {
  const [open, setOpen] = useState(false);
  const activeId = useActiveHeading(headings);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.07)]"
        aria-label="목차 열기"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-stone-500">
          <rect x="1" y="3" width="14" height="1.5" rx="0.75" fill="currentColor"/>
          <rect x="1" y="7.25" width="10" height="1.5" rx="0.75" fill="currentColor"/>
          <rect x="1" y="11.5" width="12" height="1.5" rx="0.75" fill="currentColor"/>
        </svg>
      </button>

      {/* Bottom sheet overlay */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 px-6 pt-6 pb-10 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <TitleUnderline />
              <button
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg leading-none"
                aria-label="목차 닫기"
              >
                ✕
              </button>
            </div>
            <TOCList
              headings={headings}
              activeId={activeId}
              onClickItem={() => setOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
}
