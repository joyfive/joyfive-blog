export type CategoryKey = "intro" | "skills" | "book" | "now";

export interface FieldConfig {
  key: "title" | "description" | "content" | "start_date" | "end_date";
  label: string;
  multiline?: boolean;
  placeholder?: string;
}

export interface CategoryConfig {
  label: string;
  fields: FieldConfig[];
}

export const CATEGORY_CONFIG: Record<CategoryKey, CategoryConfig> = {
  intro: {
    label: "소개",
    fields: [
      { key: "title", label: "제목", placeholder: "이름 또는 헤딩" },
      { key: "description", label: "서브타이틀", placeholder: "한 줄 소개" },
      { key: "content", label: "본문", multiline: true, placeholder: "바이오 텍스트 (줄바꿈 가능)" },
    ],
  },
  skills: {
    label: "스킬",
    fields: [
      { key: "title", label: "스킬명", placeholder: "예: TypeScript" },
      { key: "description", label: "숙련도/역할", placeholder: "예: 주력 언어" },
      { key: "content", label: "상세", multiline: true, placeholder: "설명 (줄바꿈 가능)" },
    ],
  },
  book: {
    label: "독서",
    fields: [
      { key: "title", label: "책 제목" },
      { key: "description", label: "저자", placeholder: "저자명" },
      { key: "content", label: "메모", multiline: true, placeholder: "감상/메모" },
      { key: "start_date", label: "시작일", placeholder: "YYYY-MM-DD" },
      { key: "end_date", label: "완독일", placeholder: "YYYY-MM-DD" },
    ],
  },
  now: {
    label: "지금",
    fields: [
      { key: "title", label: "활동", placeholder: "무엇을 하고 있나요?" },
      { key: "content", label: "상세", multiline: true, placeholder: "자세한 내용" },
      { key: "start_date", label: "시작일", placeholder: "YYYY-MM-DD" },
    ],
  },
};

export const VALID_CATEGORIES = Object.keys(CATEGORY_CONFIG) as CategoryKey[];
