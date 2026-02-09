import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // tailwind.config.ts
      fontFamily: {
        danjo: ["var(--font-danjo)", "sans-serif"],
        chosun: ["var(--font-chosun)", "serif"],
        pretendard: ["var(--font-pretendard)", "sans-serif"],
        ibmplex: ["var(--font-ibm)", "mono"]
      },
      // 커스텀 필터 유틸리티 추가
      filter: {
        rough: "url(#rough-border)",
      },
      // 워크샵 컨셉의 그레이스케일 컬러 세팅
      colors: {
        workshop: {
          paper: "#F4F4F2", // 미세한 종이 질감 배경
          ink: "#1A1A1A", // 잉크 블랙
          line: "#333333", // 와이어프레임용 선
        },
      },
    },
  },
  plugins: [
    // 필터를 유틸리티 클래스로 사용하기 위한 간단한 플러그인
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
