## joy-five Blog PRD (v1)

---

### 1. 목적 (Goal)

개인 블로그를 Notion 기반 CMS + Next.js 웹페이지로 운영한다.

정적 페이지(홈, 프로필, 이력, 프로젝트)와 블로그 콘텐츠를 명확히 분리한다.

콘텐츠 관리 복잡도를 최소화하면서, 향후 확장(태그, 검색)을 열어둔다.

---

### 2. 범위 (Scope)

| _포함_                    | _제외 (v1)_                |
| ------------------------- | -------------------------- |
| 홈 페이지                 | 태그 기반 필터링 페이지    |
| Profile 페이지            | 전문 검색 기능             |
| Resume 페이지             | 로그인 / 댓글 / 좋아요     |
| Projects 목록·상세 페이지 | 다중 DB 사용               |
| 블로그 메인 페이지        | —                           |
| 카테고리별 글 목록 페이지 | —                           |
| 게시글 상세 페이지        | —                           |
| Notion DB 단일 사용       | —                           |

---

### 3. 정보 구조 (IA)

```
/
├─ Home (/)
├─ Profile (/profile)           ← 정적
├─ Resume (/resume)             ← Notion 단일 페이지 (page=resume)
├─ Projects
│   ├─ 목록 (/projects)
│   └─ 상세 (/projects/[path])
└─ Blog
    ├─ 메인 (/blog)
    ├─ 카테고리별 목록 (/blog/[category])
    └─ 게시글 상세 (/blog/[category]/[path])
```

---

### 4. 페이지 정의

#### 4.1 Home (/)

- 정적 페이지
- 역할:
  - 블로그 진입점
  - 사이트 성격 전달
- 콘텐츠:
  - 블로그 링크
  - (추후 확장) 큐레이션 콘텐츠

#### 4.2 Blog 메인 (/blog)

- 모든 게시글 리스트 (page=blog)
- 정렬 기준: updated_at desc
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

#### 4.5 Profile (/profile)

- 정적 페이지
- 역할: 소개·커리어·사이드 프로젝트 등 사이트 소유자 정보 전달
- 콘텐츠: 소개, Career, Side-Project (코드에 하드코딩)

#### 4.6 Resume (/resume)

- Notion 단일 페이지 (page Select = resume) 기반
- path·category 필수 아님. page=resume인 행 1건만 조회
- 렌더링: react-notion-x 사용

#### 4.7 Projects 목록 (/projects)

- page=projects 필터로 목록 노출
- 정렬: updated_at desc
- 노출 조건: path 존재, 중복 없음

#### 4.8 Project 상세 (/projects/[path])

- page=project + path 일치하는 Notion row 1건
- 렌더링: react-notion-x 사용
- (코드상 목록용 page 값은 "projects", 상세용은 "project" 사용)

### 5. Notion DB 스키마 정책

- 단일 DB 사용. 블로그·프로젝트·이력서는 **page** (Select) 값으로 구분한다.

#### 필수 프로퍼티

| 프로퍼티   | 타입     | 정책                                       |
| ---------- | -------- | ------------------------------------------ |
| page       | Select   | 블로그·프로젝트·이력서 구분 (blog, projects, project, resume) |
| title      | Title    | 콘텐츠 제목                                |
| category   | Select   | 블로그용 단일 선택·필수. 프로젝트/이력서는 사용 방식만 상이 |
| path       | Text URL | 블로그·프로젝트 상세 식별자. 이력서(resume)는 필수 아님 |
| updated_at | Date     | 정렬 기준                                  |

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
- UI: React + Tailwind CSS
- CMS: Notion API
- Rendering: react-notion-x
- Package Manager: pnpm

### 10. 향후 확장 포인트 (명시적 비범위)

- 태그 페이지 /tag/[tag]
- 카테고리 설명 메타 페이지
- ISR 기반 캐싱 전략
- 검색 / 정렬 옵션 등
- (Profile, Resume, Projects는 v1 범위에 포함됨)
