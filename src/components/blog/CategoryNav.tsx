'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import RoughTape from '@/components/layout/RoughTape'
import type { Category } from '@/types/blog'

interface CategoryNavProps {
  categories: Category[]
  showAllPosts?: boolean
}

export default function CategoryNav({ categories, showAllPosts = true }: CategoryNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap md:flex-col gap-2">
      {showAllPosts && (
        <NavItem href="/blog" label="All Posts" isActive={pathname === '/blog'} />
      )}
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
  )
}

function NavItem({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  return (
    <Link href={href} className="relative inline-block py-1 text-sm transition-colors">
      {isActive && (
        <RoughTape
          position="lb"
          absolute
          randomRotate={false}
          width="w-full"
          height="h-5"
          className="!bottom-0 !left-0 opacity-50"
        />
      )}
      <span className={`relative z-10 ${isActive ? 'font-semibold text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>
        {label}
      </span>
    </Link>
  )
}
