'use client'
// src/components/layout/Header.tsx
import Link from "next/link";
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { HEADER_ITEMS } from "@/lib/contants";


export default function Header({ className = "" }: { className?: string }) {
  const pathname = usePathname() // 현재 전체 경로 (예: /posts/my-story)

  // '/'로 나누고 첫 번째 유효한 값을 가져옵니다.
  // 예: "/posts/123" -> ["", "posts", "123"] -> "posts" 추출
  const currentPath = pathname.split('/')[1] || 'home'
  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md ${className}`}>
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 영역 */}
        <Link href="/" className="text-xl tracking-tighter hover:text-blue-600 transition-colors font-danjo">
          Joyfive
        </Link>

        {/* 네비게이션 메뉴 */}
        <nav className="flex items-center gap-6">
          {HEADER_ITEMS.map((item) => {
            return (<Link key={item.id} href={`/${item.id}`} className={cn("text-sm font-medium text-gray-600 hover:text-black", currentPath === item.id ? "underline" : "")}>
              {item.name}
            </Link>)
          })}

        </nav>
      </div>
    </header>
  );
}