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

Three variables are required in `.env.local`:

| Variable | Purpose |
|---|---|
| `NOTION_API_KEY` | Official Notion API key — used by `@notionhq/client` for database queries |
| `NOTION_DATABASE_ID` | The Notion database that backs all content |
| `NOTION_TOKEN` | Unofficial token — used by `notion-client` (react-notion-x) to fetch full page block data |

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
| `updated_at` | last_edited_time | Sort/display date |

### Data Flow

```
Notion DB
  └─ src/lib/notion/          # Fetch layer (server-only)
       ├─ fetchCategories.ts   # Reads category options from DB schema
       ├─ fetchRecentPosts.ts  # Latest N blog posts
       ├─ fetchPostsByCategory.ts  # Posts by page+category, optionally with cover images/excerpts
       ├─ fetchPostByPath.ts   # Single post: queries by page+category+path, then fetches blocks
       └─ fetchPostByPage.ts   # Single page (resume, profile) by page name

  └─ src/lib/utils/post.ts     # Property extractors: getTitle, getRichText, getSelect, etc.
                                # filterUniquePosts: removes duplicate path entries from results

  └─ src/app/                  # Next.js pages (all Server Components except NotionDetailRenderer)
       ├─ blog/[category]/[path]/page.tsx   # Post detail
       ├─ projects/page.tsx                 # Gallery view (needImage: true)
       └─ resume|profile/page.tsx           # Single Notion pages

  └─ src/components/notion/NotionDetailRenderer.tsx  # Client Component wrapping NotionRenderer
```

### Routing

- `/blog` — Recent posts + category list
- `/blog/[category]` — Posts filtered by category
- `/blog/[category]/[path]` — Post detail (rendered via react-notion-x)
- `/projects` — Gallery grid with cover images and excerpts
- `/projects/[path]` — Project detail
- `/profile`, `/resume` — Single Notion pages

### Rendering Notion Content

Post detail pages use `react-notion-x`. The flow is:

1. Server Component fetches `recordMap` via the unofficial `NotionAPI` client
2. Passes `recordMap` to `<NotionDetailRenderer>` (a `"use client"` component)
3. `NotionRenderer` renders with `Code` (syntax highlighting) and `Equation` (KaTeX) loaded via `next/dynamic`
4. Styles come from `react-notion-x/src/styles.css` and overrides in `src/app/notion-overrides.css`

### Data Integrity

Posts with a non-unique `category+path` combination are silently excluded from listings (`filterUniquePosts` in `src/lib/utils/post.ts`). A `console.warn` is emitted for duplicates. `fetchPostByPath` also returns `null` if the query does not return exactly one result.

### Custom Fonts & Styling

Font roles (defined in `tailwind.config.ts`, loaded in `globals.css` / `layout.tsx`):

| Tailwind class | Font | Role |
|---|---|---|
| (body default) | Pretendard | 본문, UI 텍스트 |
| `font-danjo` | Danjo Bold | 브랜딩/디스플레이 (헤더 로고, 모바일 메뉴) |
| `font-ibmplex` | IBM Plex Sans KR | 코드, 모노스페이스 |

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

## Design System Rules (작업 전 반드시 숙지)

**Rough/테이프 요소 사용 기준**

- 사용 O: 홈 카드, 마스킹테이프 포인트, 태그 뱃지, 섹션 타이틀 강조
- 사용 X: 이미지 컨테이너, 본문 영역, 네비게이션 기본 상태, 리스트 아이템

**Active 상태 패턴 (헤더와 동일하게 통일)**

- 기본: 텍스트
- Active/선택: 마스킹테이프 덧씌운 느낌

## Upcoming Tasks

작업은 순서대로 진행한다 — 뒤 태스크는 앞 태스크의 정리가 완료된 상태를 전제로 한다.

1. **Header** — Resume 네비 링크 제거 (URL 직접 접근은 유지, 네비에서만 숨김) ✅
2. **Profile 페이지 삭제** → Home으로 대체 ✅
3. **코드베이스 정리** — 미사용 함수/파일 제거, 리팩토링, 반복 패턴 컴포넌트화 ✅
4. **홈 페이지** — 신규 Notion DB 연동, 위젯형 데이터 표시 (5번 이후 진행)
5. **디자인 리뉴얼** — 아래 순서로 진행 (4번보다 먼저 진행)

### 5-1. 전체 컬러/타이포 시스템 정의

- 화이트 배경 + 스톤/모노톤 컬러 팔레트 확정
- 폰트 시스템 정리

### 5-2. Home 페이지 디자인

- 마스킹테이프 + rough 카드 유지 (가장 잘 어울리는 영역)
- 카드 간 여백/정렬 정리

### 5-3. Blog 목록 페이지

- 카테고리 사이드바: 헤더 active 패턴 동일하게 적용 (기본 텍스트 → 선택 시 테이프)
- 태그 뱃지: 테이프 느낌으로 고정 디자인 교체
- 카테고리 active 상태 디자인 정리

### 5-4. Projects 페이지

- 이미지 있는 카드: rough border 제거 → 클린한 border로 교체
- 마스킹테이프 요소만 유지
- 카드 hover 인터랙션 추가

### 5-5. Blog/Project 상세 페이지

- 본문 영역: rough 요소 없이 가독성 중심
- 태그 뱃지: 5-3과 동일한 테이프 디자인 적용
