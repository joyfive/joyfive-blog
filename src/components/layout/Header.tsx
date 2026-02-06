'use client'

import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { HEADER_ITEMS } from "@/lib/contants";
import { cn } from "@/lib/utils";
import RoughTape from "@/components/layout/RoughTape";

export default function Header({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const currentPath = pathname.split('/')[1] || 'home';

  // 페이지 이동 시 모달 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md ${className}`}>
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* 로고 영역 */}
        <Link href="/" className="text-xl tracking-tighter hover:text-stone-600 transition-colors font-danjo z-[60]">
          오늘의 기쁨
        </Link>

        {/* 1. PC 네비게이션 (md 이상에서만 표시) */}
        <nav className="hidden md:flex items-center gap-6">
          {HEADER_ITEMS.map((item) => {
            const isActive = currentPath === item.id;
            return (
              <Link
                key={item.id}
                href={`/${item.id}`}
                className={cn(
                  "relative inline-block py-1 text-sm font-medium text-stone-600 hover:text-stone-700 w-14 text-center",
                  isActive ? "text-stone-800 font-bold" : ""
                )}
              >
                {isActive && (
                  <RoughTape
                    position="lb"
                    absolute
                    randomRotate={false}
                    width="w-16"
                    height="h-5"
                    className="bottom-1 !-left-1 opacity-60"
                  />
                )}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 2. 모바일 네비게이션 (md 미만에서만 표시) */}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="md:hidden p-2 outline-none flex flex-col gap-1.5 items-end group">
              <span className={cn("h-0.5 bg-stone-800 transition-all", open ? "w-6 rotate-45 translate-y-2" : "w-6")} />
              <span className={cn("h-0.5 bg-stone-800 transition-all", open ? "opacity-0" : "w-4")} />
              <span className={cn("h-0.5 bg-stone-800 transition-all", open ? "w-6 -rotate-45 -translate-y-2" : "w-5")} />
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <AnimatePresence>
              {open && (
                <Dialog.Content forceMount asChild>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed inset-0 z-[100] bg-white flex flex-col p-6"
                  >
                    {/* 모달 상단 헤더 공간 */}
                    <div className="flex justify-between items-center h-10 mb-16">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">
                        Thinking & Making Archive
                      </span>
                      <Dialog.Close asChild>
                        <button className="p-2 border border-stone-200 filter-rough bg-white hover:bg-stone-50 transition-colors">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </Dialog.Close>
                    </div>

                    {/* 모바일 세로형 메뉴 */}
                    <nav className="flex flex-col gap-8">
                      {HEADER_ITEMS.map((item, idx) => {
                        const isActive = currentPath === item.id;
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Link
                              href={`/${item.id}`}
                              className="relative inline-block"
                            >
                              <span className={cn(
                                "text-5xl font-serif italic tracking-tight transition-all",
                                isActive ? "text-stone-900 underline decoration-stone-200 underline-offset-8" : "text-stone-300"
                              )}>
                                {item.name}
                              </span>
                              {isActive && (
                                <div className="absolute -inset-x-4 top-1/2 -translate-y-1/2 -z-10">
                                  <RoughTape
                                    position="t"
                                    absolute
                                    width="w-full"
                                    height="h-10"
                                    className="opacity-20"
                                  />
                                </div>
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </nav>

                    {/* 하단 푸터 느낌 장식 */}
                    <div className="mt-auto pb-8">
                      <p className="text-[10px] font-mono text-stone-300 leading-loose">
                        © 2024 Joyfive Workshop.<br />
                        Built with Next.js & Notion.
                      </p>
                    </div>
                  </motion.div>
                </Dialog.Content>
              )}
            </AnimatePresence>
          </Dialog.Portal>
        </Dialog.Root>

      </div>
    </header>
  );
}