"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const TABS = [
  { key: "intro", label: "소개" },
  { key: "skills", label: "스킬" },
  { key: "book", label: "독서" },
  { key: "now", label: "지금" },
  { key: "jandi", label: "잔디" },
] as const;

export default function FloatingNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const logKey = searchParams.get("key") ?? "";

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="relative flex items-center gap-1 bg-white px-2 py-2 shadow-lg">
        <span
          className="absolute inset-0 filter-rough border border-stone-300 pointer-events-none"
          aria-hidden="true"
        />
        {TABS.map((tab) => {
          const href = `/admin/${tab.key}?key=${logKey}`;
          const isActive = pathname === `/admin/${tab.key}`;
          return (
            <Link
              key={tab.key}
              href={href}
              className={`
                relative px-4 py-2 text-sm font-semibold transition-colors
                ${isActive ? "text-stone-800" : "text-stone-400 hover:text-stone-600"}
              `}
            >
              {isActive && (
                <span
                  className="absolute inset-x-1 inset-y-0.5 bg-stone-100 filter-rough"
                  aria-hidden="true"
                />
              )}
              <span className="relative">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
