// src/lib/utils/category.ts
import { Category } from "@/types/blog"

// 필요하다면 '전체보기' 항목을 추가하거나, 특정 순서로 정렬하는 로직을 여기 둡니다.
export const formatCategoryList = (categories: Category[]): Category[] => {
  // 예: 가나다순 정렬 등 비즈니스 로직 추가 가능
  return categories.sort((a, b) => a.name.localeCompare(b.name))
}
