"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect } from "react";
import { annotate } from "rough-notation";
import type { Category } from "@/types/blog";

interface CategoryNavProps {
  categories: Category[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap md:flex-col gap-2">
      <NavItem href="/blog" label="All Posts" isActive={pathname === "/blog"} />
      {categories.map((cat) => (
        <NavItem
          key={cat.id}
          href={`/blog/${cat.name}`}
          label={cat.name}
          isActive={
            pathname === `/blog/${cat.name}` ||
            pathname.startsWith(`/blog/${cat.name}/`)
          }
        />
      ))}
    </nav>
  );
}

function NavItem({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!spanRef.current || !isActive) return;
    const ann = annotate(spanRef.current, {
      type: "underline",
      animate: true,
      color: "#78716c",
      strokeWidth: 1.5,
      padding: 2,
    });
    ann.show();
    return () => ann.remove();
  }, [isActive]);

  return (
    <Link href={href} className="py-1 text-sm transition-colors">
      <span
        ref={spanRef}
        className={
          isActive
            ? "font-semibold text-stone-800"
            : "text-stone-500 hover:text-stone-700"
        }
      >
        {label}
      </span>
    </Link>
  );
}
