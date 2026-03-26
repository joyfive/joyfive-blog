## joy-five Blog PRD (v1)

---

### 1. 목적 (Goal)

개인 블로그를 Notion 기반 CMS + Next.js 웹페이지로 운영한다.

홈 콘텐츠를 위한 CMS DB와 포스팅 목적의 프로젝트/블로그 콘텐츠 DB를 분리하여 관리한다.

콘텐츠 관리 복잡도를 최소화하면서, 향후 확장(태그, 검색)을 열어둔다.

---

### 2. 범위 (Scope)

| _포함_                    | _제외 (v1)_                |
| ------------------------- | -------------------------- |
| 홈 페이지                 | 태그 기반 필터링 페이지    |
| Projects 목록·상세 페이지 | 전문 검색 기능                 |
| 블로그 메인 페이지        | —                           |
| 카테고리별 글 목록 페이지 | —                           |
| 게시글 상세 페이지        | —                           |
| Notion DB 단일 사용       | —                           |
| 잔디 기록 어드민 페이지   | —                           |

---

### 3. 정보 구조 (IA)

```
/
├─ Home (/)
├─ Projects
│   ├─ 목록 (/projects)
│   └─ 상세 (/projects/[path])
├─ Blog
│   ├─ 메인 (/blog)
│   ├─ 카테고리별 목록 (/blog/[category])
│   └─ 게시글 상세 (/blog/[category]/[path])
└─ Admin (숨김)
    └─ 잔디 기록 (/admin/jandi?key=LOG_KEY)
```

---

### 4. 페이지 정의

#### 4.1 Home (/)

- Notion 기반 동적 페이지
- 역할: 블로그 진입점, 사이트 성격 전달
- 콘텐츠 (profile-cms DB, `NOTION_PROFILE_DB_ID`):
  - IntroWidget (category=intro): 자기소개
  - SkillsWidget (category=skills): 기술 스택 pill 목록
  - BookWidget (category=book) + NowWidget (category=now): 2열 위젯
  - JandiWidget: 활동 트래커 (`NOTION_JANDI_DB_ID`), 모바일 반응형 자동 컬럼

#### 4.2 Blog 메인 (/blog)

- 모든 게시글 리스트 (page=blog)
- 정렬 기준: published_at desc
- 노출 조건: path 값이 존재, category 값이 존재
- 기능: 전체 카테고리 링크 노출

#### 4.3 카테고리 페이지 (/blog/[category])

- Notion DB의 category (Select) + page=blog 기반으로 동적 생성
- URL: category 값 그대로 사용 (영문 slug)
- 노출 정책: 해당 category에 속한 게시글이 1개 이상일 경우에만 유효
- 게시글 리스트 조건: page=blog, category 일치, path 존재

#### 4.4 게시글 상세 (/blog/[category]/[path])

- 단일 게시글 페이지
- 데이터 기준: Notion DB row 1개 (page=blog, category·path 일치)
- URL 매칭 규칙: category === category, path === path
- 렌더링: Notion content → react-notion-x 사용
- 상단: 카테고리 뱃지(테이프 스타일) + 날짜 + 제목 + 태그(rough-notation box)
- 목차(TOC): 데스크탑 sticky 사이드바 / 모바일 플로팅 버튼 + 바텀시트, IntersectionObserver 활성 추적
- 하단: 같은 카테고리 최신 3개 글 (RelatedPosts)

#### 4.5 Projects 목록 (/projects)

- page=projects 필터로 목록 노출
- 정렬: published_at desc
- 노출 조건: path 존재, 중복 없음

#### 4.6 Project 상세 (/projects/[path])

- page=project + path 일치하는 Notion row 1건
- 렌더링: react-notion-x 사용
- (코드상 목록용 page 값은 "projects", 상세용은 "project" 사용)

#### 4.7 잔디 기록 어드민 (/admin/jandi)

- 숨김 페이지 — robots: noindex, `?key=LOG_KEY` 파라미터 인증 필수 (불일치 시 404)
- 서버에서 Notion jandi DB의 type 옵션 목록 + 오늘(KST) 완료 타입 목록 fetch
- JandiLogger (Client Component): 타입별 버튼 탭 → Server Action으로 Notion 레코드 생성
- 완료 상태는 즉시 UI 반영 (페이지 리로드 없이 Set 업데이트)

### 5. Notion DB 스키마 정책
- 프로필 페이지는 CMS DB와 로그성 트래커 JANDI DB 2종 사용.

#### tracking-jandi(활동 기록 테이블)
| 프로퍼티 | 타입 | 정책 |
| ---------- | -------- |------------------------------------------ |
| **title** | Title | 미사용, 데이터 생성용 |
| **type** | Select | 활동 성격 구분 (읽기, 개발, 기록, 수영 등 동적 확장 가능) |
| **created_at** | Date | 활동이 기록되거나 수행된 날짜 |

#### profile-cms (프로필 콘텐츠 관리 테이블)
| 프로퍼티 | 타입 | 정책 |
| ----------|  -------- | ------------------------------------------ |
| **title** | Title | 항목의 대제목 (예: Overview) |
| **category** | Select | 콘텐츠의 분류 (intro, skills, book, now 4종 고정) |
| **content** | Text | 핵심 문구 또는 요약된 내용 |
| **description** | Text | 상세 설명 및 구체적인 본문 내용 |
| **start_date** | Date | 해당 이력/활동의 시작일 |
| **end_date** | Date | 해당 이력/활동의 종료일 |
| **img** | Files & Media | 관련 이미지 또는 썸네일 파일 링크 (book,now 위젯만 대응) |

---

- 블로그/프로젝트 단일 DB 사용. 블로그·프로젝트는 **page** (Select) 값으로 구분한다.

#### 필수 프로퍼티

| 프로퍼티   | 타입     | 정책                                       |
| ---------- | -------- | ------------------------------------------ |
| page       | Select   | 블로그·프로젝트·이력서 구분 (blog, project) |
| title      | Title    | 콘텐츠 제목                                |
| category   | Select   | 블로그용 단일 선택·필수. 프로젝트는 사용 방식만 상이 |
| path       | Text URL | 블로그·프로젝트 상세 식별자. |
| published_at | Date     | 정렬 기준                                  |

#### 선택 프로퍼티

| 프로퍼티 | 타입         | 용도                              |
| -------- | ------------ | --------------------------------- |
| tags     | Multi-select | 페이지 내 렌더링 / 추후 검색 확장 |

### 6. 노출 정책 (중요)

- **블로그·Projects** 공통: 아래 중 하나라도 해당 시 사용자 페이지에 노출하지 않음
  - path가 비어 있음 (이력서 단일 페이지는 예외)
  - path가 중복됨
  - 블로그의 경우 category가 없음
- 미노출 데이터는 CMS에는 존재하나, 서비스 영역에서는 무시한다.

### 7. URL 정책

- 한 게시글은 하나의 canonical URL만 가진다
- 한글 제목, Notion page id는 URL에 사용하지 않는다
- URL은 명시적으로 작성된 path만 사용
- 예시:
  - /blog/dev/notion-blog-architecture
  - /blog/log/2026-retrospective
  - /projects/notion-blog

### 8. 태그(tags) 정책

- Multi-select 사용
- 역할: 게시글 상세 페이지 내 메타 정보 표시
- v1에서는: 태그 기반 페이지 / 필터링 제공하지 않음
- v2 확장 시: 태그 검색 또는 태그별 리스트 페이지 가능

### 9. 기술 스택 (확정)

- Framework: Next.js (App Router)
- Language: TypeScript
- UI: React + Tailwind CSS + rough-notation
- CMS: Notion API (공식 `@notionhq/client` + 비공식 `notion-client`)
- Rendering: react-notion-x
- Package Manager: pnpm
- Analytics: Google Tag Manager (`NEXT_PUBLIC_GTM_ID`)

### 10. 향후 확장 포인트 (명시적 비범위)

- 태그 페이지 /tag/[tag]
- 카테고리 설명 메타 페이지
- 검색 / 정렬 옵션 등
- (Profile, Projects는 v1 범위에 포함됨)

### 11. 완료된 인프라 항목

- SEO: `generateMetadata` (글·카테고리별), `sitemap.xml`, `robots.txt`
- OG 이미지: `public/og-image.png` (1200×630) — 링크 공유 시 카카오/SNS 미리보기 썸네일
- PWA: `manifest.json`, 파비콘 (`icon.svg`, `apple-icon.png`), `/admin` PWA 비활성화
- ISR 캐싱: 홈·상세 300초, `/blog`·`/projects` force-dynamic
- 로딩 UI: 모든 라우트 세그먼트에 `loading.tsx` 적용 — 글자별 순차 등장 애니메이션
- 잔디 기록 어드민: `/admin/jandi` — 타입 탭 기록, 오늘 완료 상태 즉시 반영
