import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Font roles:
      // font-danjo      → 브랜딩/디스플레이 (헤더 로고, 모바일 메뉴)
      // font-pretendard → 본문 기본 (body default)
      // font-orbit      → 코드블럭, 인용문, 노션 헤딩
      fontFamily: {
        danjo: ["var(--font-danjo)", "sans-serif"],
        pretendard: ["var(--font-pretendard)", "sans-serif"],
        orbit: ["var(--font-orbit)", "sans-serif"],
      },
      // Color palette: white background + stone monotone
      // stone-50  → 서브 배경 (카드 이면, hover)
      // stone-100 → 태그 뱃지 배경, 구분선
      // stone-200 → border
      // stone-400 → 보조 텍스트 (날짜, 메타)
      // stone-500 → 중간 텍스트
      // stone-700 → 본문 텍스트
      // stone-800 → 제목
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        blink: "blink 0.5s step-end infinite",
      },
      filter: {
        rough: "url(#rough-border)",
      },
    },
  },
  plugins: [
    ({ addUtilities }: any) => {
      addUtilities({
        ".filter-rough": {
          filter: "url(#rough-border)",
        },
      })
    },
  ],
}
export default config
