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
  hasImage?: boolean;
}

// 공통 필드 (전 카테고리)
const COMMON_FIELDS: FieldConfig[] = [
  { key: "title",       label: "섹션",   placeholder: "" },
  { key: "content",     label: "타이틀", multiline: true, placeholder: "" },
  { key: "description", label: "상세",   multiline: true, placeholder: "" },
];

// book / now 추가 필드
const DATE_FIELDS: FieldConfig[] = [
  { key: "start_date", label: "시작일", placeholder: "YYYY-MM-DD" },
  { key: "end_date",   label: "종료일", placeholder: "YYYY-MM-DD" },
];

export const CATEGORY_CONFIG: Record<CategoryKey, CategoryConfig> = {
  intro:  { label: "소개", fields: COMMON_FIELDS },
  skills: { label: "스킬", fields: COMMON_FIELDS },
  book:   { label: "독서", fields: [...COMMON_FIELDS, ...DATE_FIELDS], hasImage: true },
  now:    { label: "지금", fields: [...COMMON_FIELDS, ...DATE_FIELDS] },
};

export const VALID_CATEGORIES = Object.keys(CATEGORY_CONFIG) as CategoryKey[];
