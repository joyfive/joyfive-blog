import type { Metadata } from "next";

export const metadata: Metadata = {
  // PWA 동작 비활성화: 홈화면 추가 시 standalone 실행 방지
  manifest: null as any,
  appleWebApp: {
    capable: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
