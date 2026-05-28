"use client";

import Link from "next/link";
import { useRef, useEffect, useState, useCallback } from "react";
import { annotate } from "rough-notation";

interface PostDetailHeaderProps {
  category: string;
  publishedAt: string;
  title: string;
  tags: string[];
}

function RoughTagBox({ tag }: { tag: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ann = annotate(ref.current, {
      type: "box",
      animate: false,
      color: "#a8a29e",
      strokeWidth: 0.3,
      padding: 3,
    });
    ann.show();
    return () => ann.remove();
  }, []);

  return (
    <span ref={ref} className="text-xs text-stone-500 px-0.5">
      {tag}
    </span>
  );
}

function ShareButton() {
  const [toast, setToast] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ url });
    } else {
      await navigator.clipboard.writeText(url);
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    }
  }, []);

  return (
    <>
      <button
        onClick={handleShare}
        aria-label="공유"
        className="flex items-center justify-center p-1.5 rounded-sm text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v13" />
          <path d="m16 6-4-4-4 4" />
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        </svg>
      </button>

      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-stone-800 text-white text-sm rounded-md shadow-lg transition-all duration-300 ${
          toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        게시글 링크가 복사되었습니다.
      </div>
    </>
  );
}

export default function PostDetailHeader({
  category,
  publishedAt,
  title,
  tags,
}: PostDetailHeaderProps) {
  return (
    <header className="mb-10">
      {/* Category badge + Date + Share */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link href={`/blog/${category}`}>
            <span className="relative inline-flex items-center px-2 py-0.5 text-xs font-medium text-stone-600">
              <span
                className="absolute inset-0 bg-stone-700/10 border border-stone-700/20 filter-rough pointer-events-none"
                aria-hidden="true"
              />
              <span className="relative">{category}</span>
            </span>
          </Link>
          {publishedAt && (
            <time className="text-xs text-stone-400">
              {new Date(publishedAt).toLocaleDateString("ko-KR")}
            </time>
          )}
        </div>
        <ShareButton />
      </div>

      {/* Title */}
      <h1 className="font-orbit text-3xl font-bold text-stone-800 leading-snug mb-5">
        {title}
      </h1>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6">
          {tags.map((tag) => (
            <RoughTagBox key={tag} tag={tag} />
          ))}
        </div>
      )}

      {/* Divider */}
      <hr className="border-stone-200" />
    </header>
  );
}
