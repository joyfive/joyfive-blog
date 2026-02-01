// src/components/layout/Header.tsx
import Link from "next/link";
import { fetchCategories } from "@/lib/notion/fetchCategories";

export default async function Header({ className = "" }: { className?: string }) {
  const categories = await fetchCategories();

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md ${className}`}>
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 영역 */}
        <Link href="/" className="text-xl font-bold tracking-tighter hover:text-blue-600 transition-colors">
          JOYFIVE BLOG
        </Link>

        {/* 네비게이션 메뉴 */}
        <nav className="flex items-center gap-6">
          <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-black">
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog/${cat.name}`}
              className="text-sm font-medium text-gray-600 hover:text-black capitalize"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}