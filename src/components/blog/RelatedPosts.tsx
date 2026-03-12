"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";
import type { BlogPost } from "@/types/blog";

function RelatedPostItem({ post }: { post: BlogPost }) {
  const ref = useRef<HTMLSpanElement>(null);
  const annRef = useRef<RoughAnnotation | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const ann = annotate(ref.current, {
      type: "underline",
      animate: false,
      color: "#a8a29e",
      strokeWidth: 1,
      padding: 1,
    });
    annRef.current = ann;
    return () => ann.remove();
  }, []);

  useEffect(() => {
    if (!annRef.current) return;
    if (hovered) {
      annRef.current.show();
    } else {
      annRef.current.hide();
    }
  }, [hovered]);

  return (
    <li className="py-3 border-b border-stone-100 last:border-0">
      <Link
        href={`/blog/${post.category}/${post.path}`}
        className="flex items-center justify-between gap-4 group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span ref={ref} className="text-sm text-stone-700 leading-snug">
          {post.title}
        </span>
        {post.published_at && (
          <time className="text-xs text-stone-400 shrink-0">
            {new Date(post.published_at).toLocaleDateString("ko-KR")}
          </time>
        )}
      </Link>
    </li>
  );
}

interface RelatedPostsProps {
  posts: BlogPost[];
  category: string;
}

export default function RelatedPosts({ posts, category }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-stone-200">
      <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">
        {category}의 다른 글
      </h2>
      <ul>
        {posts.map((post) => (
          <RelatedPostItem key={post.id} post={post} />
        ))}
      </ul>
    </section>
  );
}
