import type { Metadata } from "next"
import "./globals.css"
import "./notion-overrides.css"
import { Suspense } from "react";
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import RoughFilter from "@/components/layout/RoughFilter";
import Loading from "./loading";
import localFont from 'next/font/local'
import { GoogleTagManager } from "@next/third-parties/google"

export const metadata: Metadata = {
  title: "오늘의 기쁨",
  description: "기획자, 때로는 개발도 하고 가끔은 글도 씁니다.",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
}


const danjo = localFont({
  src: '../fonts/Danjo-bold-Regular.otf',
  variable: '--font-danjo',
  display: 'swap',
  preload: true,
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={danjo.variable}>

      <body className="min-h-screen flex flex-col">
        <RoughFilter />
        <Header className="sticky top-0 z-50 shrink-0 bg-white" />
        <main className="flex-1 min-h-0 py-20 px-5 h-auto">
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </main>
        <Footer className="shrink-0" />
      </body>
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      )}

    </html>
  )
}
