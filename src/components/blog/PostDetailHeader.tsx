"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
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

export default function PostDetailHeader({
  category,
  publishedAt,
  title,
  tags,
}: PostDetailHeaderProps) {
  return (
    <header className="mb-10">
      {/* Category badge + Date */}
      <div className="flex items-center gap-3 mb-5">
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

      {/* Title */}
      <h1 className="text-3xl font-bold text-stone-800 leading-snug mb-5">
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
