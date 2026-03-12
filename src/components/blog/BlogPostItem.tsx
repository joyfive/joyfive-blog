"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { annotate } from "rough-notation";
import type { BlogPost } from "@/types/blog";

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

export default function BlogPostItem({ post }: { post: BlogPost }) {
  return (
    <article className="py-8 first:pt-0 border-b border-stone-200 last:border-0">
      <Link
        href={`/blog/${post.category}/${post.path}`}
        className="flex flex-col gap-2.5 group"
      >
        {/* 카테고리 배지 + 날짜 */}
        <div className="flex items-center gap-3">
          <span className="relative inline-flex items-center px-2 py-0.5 text-xs font-medium text-stone-600">
            <span
              className="absolute inset-0 bg-stone-700/10 border border-stone-700/20 filter-rough pointer-events-none"
              aria-hidden="true"
            />
            <span className="relative">{post.category}</span>
          </span>
          {post.published_at && (
            <time className="text-xs text-stone-400">
              {new Date(post.published_at).toLocaleDateString("ko-KR")}
            </time>
          )}
        </div>

        {/* 제목 */}
        <h3 className="text-[20px] font-semibold text-stone-800 group-hover:text-stone-500 transition-colors leading-snug">
          {post.title}
        </h3>

        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {post.tags.map((tag) => (
              <RoughTagBox key={tag} tag={tag} />
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
