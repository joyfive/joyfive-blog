# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev      # Start development server
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Environment Variables

Variables required in `.env.local`:

| Variable | Purpose |
|---|---|
| `NOTION_API_KEY` | Official Notion API key — used by `@notionhq/client` for database queries |
| `NOTION_DATABASE_ID` | The Notion database that backs all content |
| `NOTION_TOKEN` | Unofficial token — used by `notion-client` (react-notion-x) to fetch full page block data |
| `NOTION_PROFILE_DB_ID` | profile-cms DB — home page widgets (intro/skills/book/now categories) |
| `NOTION_JANDI_DB_ID` | jandi DB — activity tracker widget |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container ID (e.g. `GTM-XXXXXXX`) |
| `LOG_KEY` | 잔디 기록 어드민 페이지 접근 키 (`/admin/jandi?key=xxx`) |

## Architecture

### Stack

Next.js 14 App Router, TypeScript, Tailwind CSS, pnpm.

### Notion as CMS — Dual Client Pattern

All content lives in a single Notion database. The app uses **two separate Notion clients** for different purposes:

- **`@notionhq/client`** (`src/lib/notion/client.ts`): Official API. Used for structured database queries (filtering, sorting, listing posts, fetching categories).
- **`notion-client` from react-notion-x** (`fetchPostByPath.ts`, `fetchPostByPage.ts`): Unofficial API authenticated via `NOTION_TOKEN`. Used exclusively to fetch full page block content for rendering with `react-notion-x`.

### Notion Database Schema

Each record has these properties:

| Property | Type | Purpose |
|---|---|---|
| `page` | select | Namespace — `"blog"` or `"projects"` |
| `category` | select | Category within the page |
| `path` | rich_text | URL slug. Must be non-empty to be shown. |
| `title` | title | Post title |
| `tags` | multi_select | Tags |
| `published_at` | date | Sort/display date |

### Data Flow

```
Notion DB
  └─ src/lib/notion/          # Fetch layer (server-only)
       ├─ fetchCategories.ts        # Reads category options from DB schema
       ├─ fetchPostsByCategory.ts   # Posts by page+category, optionally with cover images/excerpts
       │                             # categoryName이 빈 문자열이면 category 필터 생략 (전체 조회)
       ├─ fetchPostByPath.ts        # Single post: queries by page+category+path, then fetches blocks
       │                             # Returns { id, recordMap, properties }
       ├─ fetchPostMeta.ts          # generateMetadata 전용 경량 쿼리 (블록 fetch 없이 title/tags만)
       ├─ fetchAllPostsForSitemap.ts # sitemap.ts 전용 — page 전체 포스트 목록 (블록 없음)
       ├─ fetchProfileCms.ts        # Home widgets: intro/skills/book/now (NOTION_PROFILE_DB_ID)
       └─ fetchJandiData.ts         # Activity tracker (NOTION_JANDI_DB_ID)
                                    # fetchJandiTypes: DB select 옵션 목록
                                    # fetchJandiRecords: 최근 91일 기록
                                    # fetchTodayJandiTypes: 오늘(KST) 기록된 type 목록 (admin용)

  └─ src/lib/utils/
       ├─ post.ts     # Property extractors: getTitle, getRichText, getSelect, etc.
       │               # filterUniquePosts: removes duplicate path entries from results
       ├─ toc.ts      # extractHeadings(recordMap): parses header/sub_header/sub_sub_header blocks
       │               # in document order → HeadingItem[] for TableOfContents
       └─ og.ts       # extractOgDescription(recordMap): 첫 텍스트 블록 → OG description (max 100자)
                       # extractFirstImageUrl(recordMap): 첫 image 블록 URL 반환 (없으면 null)
                       # getOgImage(recordMap): 첫 이미지 URL 또는 OG_FALLBACK_IMAGE 반환

  └─ src/app/                  # Next.js pages (all Server Components except where noted)
       ├─ api/notion-image/route.ts         # GET /api/notion-image?id={pageId}
       │                                    # Notion 페이지의 img 프로퍼티 이미지를 프록시 (5분 캐싱)
       │                                    # profile-cms book/now 위젯 이미지에 사용
       ├─ blog/page.tsx                     # All posts, paginated 10/page (?page=N)
       ├─ blog/[category]/[path]/page.tsx   # Post detail (PostDetailHeader + TOC + RelatedPosts)
       ├─ projects/page.tsx                 # Gallery view (needImage: true)
       ├─ profile/page.tsx                  # Single Notion page
       └─ admin/jandi/                      # 잔디 기록 어드민 (숨김 페이지)
            ├─ page.tsx                     # 서버 컴포넌트 — LOG_KEY 인증, types+오늘완료 fetch
            ├─ JandiLogger.tsx             # "use client" — 타입별 기록 버튼, 완료 상태 관리
            └─ actions.ts                  # "use server" — Notion pages.create (오늘 KST 날짜)

  └─ src/components/
       ├─ notion/NotionDetailRenderer.tsx   # "use client" — wraps react-notion-x NotionRenderer
       ├─ layout/PageHeader.tsx             # 페이지 상단 타이틀/디스크립션 공통 컴포넌트
       │                                    #   /blog, /blog/[category], /projects 에서 공유
       ├─ blog/
       │   ├─ PostDetailHeader.tsx          # "use client" — category tape + date + title + rough tags
       │   ├─ Pagination.tsx                # Prev/next + page numbers, active page uses rough box
       │   ├─ TableOfContents.tsx           # "use client" — DesktopTOC (sticky sidebar) +
       │   │                                #   MobileTOC (floating button + bottom sheet)
       │   │                                #   IntersectionObserver for active heading tracking
       │   └─ RelatedPosts.tsx              # "use client" — same-category latest 3, hover underline
       └─ jandi/
           ├─ JandiGrid.tsx                 # Shared grid renderer (no directive)
           └─ MobileAdaptiveGrid.tsx        # "use client" — ResizeObserver로 컨테이너 폭 측정,
                                            #   numWeeks = floor((width-38)/48), clamped [3,5]
                                            #   → 35일·28일·21일 자동 전환
```

### Routing

- `/blog` — All posts (paginated, 10/page via `?page=N`) + category list
- `/blog/[category]` — Posts filtered by category
- `/blog/[category]/[path]` — Post detail (rendered via react-notion-x)
- `/projects` — Gallery grid with cover images and excerpts
- `/projects/[path]` — Project detail
- `/profile` — Single Notion page
- `/admin/jandi?key=LOG_KEY` — 잔디 기록 전용 숨김 페이지 (robots: noindex, key 불일치 시 notFound)

### Rendering Notion Content

Post detail pages use `react-notion-x`. The flow is:

1. Server Component fetches `recordMap` via the unofficial `NotionAPI` client
2. `extractHeadings(recordMap)` in `src/lib/utils/toc.ts` traverses the page block tree to extract heading items in document order (block types: `header`→h1, `sub_header`→h2, `sub_sub_header`→h3). HTML anchor ID = `blockId.replace(/-/g, '')` (react-notion-x format).
3. Passes `recordMap` to `<NotionDetailRenderer>` (a `"use client"` component)
4. `NotionRenderer` renders with `Code` (syntax highlighting) and `Equation` (KaTeX) loaded via `next/dynamic`
5. Styles come from `react-notion-x/src/styles.css` and overrides in `src/app/notion-overrides.css`

### Data Integrity

Posts with a non-unique `category+path` combination are silently excluded from listings (`filterUniquePosts` in `src/lib/utils/post.ts`). A `console.warn` is emitted for duplicates. `fetchPostByPath` also returns `null` if the query does not return exactly one result.

### SEO & PWA

- `src/app/sitemap.ts` → `/sitemap.xml` 자동 생성 (정적 페이지 + 블로그 전체 + 프로젝트 전체), 24시간 ISR
- `src/app/robots.ts` → `/robots.txt` 생성
- `public/manifest.json` → PWA 매니페스트 (standalone, icon-192/512)
- `src/app/icon.svg`, `src/app/apple-icon.png` → Next.js App Router 파비콘 컨벤션
- `public/og-image.png` → OG/Twitter 카드 기본 썸네일 (1200×630px)
- `generateMetadata` — 각 페이지별 title/description/openGraph/twitter 개별 설정
  - `/blog/[category]/[path]`, `/projects/[path]`: 본문 첫 이미지(`getOgImage`)를 OG·twitter 이미지로 사용, 없으면 `og-image.png` fallback
  - 그 외 페이지: `og-image.png` 공통 사용
- `metadataBase: new URL("https://joyfive-blog.vercel.app")` — root layout에 설정, 상대 URL 안정적 해석
- `verification` — Google Search Console + Naver Search Advisor 인증 태그 (root layout `metadata.verification`)
- `src/app/admin/layout.tsx` — `/admin` 하위 페이지는 PWA 비활성화 (manifest: null, appleWebApp.capable: false)

### ISR 캐싱 전략

| 페이지 | revalidate | 이유 |
|---|---|---|
| `/` (홈) | 300초 (5분) | 프로필 CMS·잔디 수정 반영 |
| `/blog`, `/projects` | force-dynamic | 매 요청마다 최신 목록 fetch |
| `/blog/[category]` | Dynamic (ƒ) | 요청마다 실시간 렌더링 |
| `/blog/[category]/[path]`, `/projects/[path]` | 300초 (5분) | Notion 수정 후 최대 5분 내 반영 |
| `/sitemap.xml` | 86400초 (24시간) | 신규 포스트 반영 주기 |

### 로딩 UI

- `src/app/loading.tsx` — 글자별 순차 등장 애니메이션. 루트 레벨 (`/`)에만 자동 적용.
- 각 라우트 세그먼트에 `loading.tsx`를 두어 공통 적용: `blog/`, `blog/[category]/`, `blog/[category]/[path]/`, `projects/`, `projects/[path]/` 모두 `export { default } from "@/app/loading"` 재사용.

### Custom Fonts & Styling

Font roles (defined in `tailwind.config.ts`, loaded in `globals.css` / `layout.tsx`):

| Tailwind class | Font | Role |
|---|---|---|
| (body default) | Pretendard | 본문, UI 텍스트 |
| `font-danjo` | Danjo Bold | 브랜딩/디스플레이 (헤더 로고, 모바일 메뉴) |
| `font-orbit` | Orbit | 코드블럭, 인용문, 노션 헤딩 |

Color palette (white background + stone monotone):

| stone shade | 용도 |
|---|---|
| white / stone-50 | 배경, 카드 이면, hover |
| stone-100 | 태그 뱃지 배경, 구분선 |
| stone-200 | border |
| stone-400 | 보조 텍스트 (날짜, 메타) |
| stone-500 | 중간 텍스트 |
| stone-700 | 본문 텍스트 |
| stone-800 | 제목 |

The `RoughFilter` component injects an SVG `<filter id="rough-border">` used via the `.filter-rough` Tailwind utility class for a hand-drawn visual effect.

**CSS 레이어 구조 (중요)**

`globals.css`에서 `body`와 `h1-h6` 스타일은 반드시 `@layer base {}` 안에 위치해야 한다. unlayered 스타일은 Tailwind utilities layer보다 우선순위가 높아 `font-orbit` 등 유틸리티 클래스가 override되지 않는다.

## Workflow

- 작업 단위별로 완료 시 자동으로 커밋한다.
- 푸시는 사용자가 명시적으로 요청할 때만 실행한다.

## Design System Rules (작업 전 반드시 숙지)

**Rough/테이프 요소 사용 기준**

- 사용 O: 홈 카드, 마스킹테이프 포인트, 태그 뱃지, 섹션 타이틀 강조
- 사용 X: 이미지 컨테이너, 본문 영역, 네비게이션 기본 상태, 리스트 아이템

**Active 상태 패턴 (헤더와 동일하게 통일)**

- 기본: 텍스트
- Active/선택: 마스킹테이프 덧씌운 느낌

