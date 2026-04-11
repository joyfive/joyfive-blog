/**
 * react-notion-x가 렌더링할 때 uuidToId(undefined) 호출로 TypeError가 발생하는 케이스를 방어.
 *
 * 원인:
 *  - notion-utils의 uuidToId = (uuid) => uuid.replaceAll("-", "") 은 null 체크 없음
 *  - recordMap.block 에 value.id 가 없는 블록이 있거나
 *  - block.content 배열에 recordMap에 없는 블록 ID가 참조될 때 crash
 *
 * 처리:
 *  1. value.id 가 없는 블록 → 키(blockId)로 채움
 *  2. content 배열 → recordMap에 실제로 존재하는 유효한 ID만 남김
 */
export function sanitizeRecordMap(recordMap: any): any {
  if (!recordMap?.block) return recordMap;

  const blockMap: Record<string, any> = recordMap.block;

  // 0차: 이중 중첩 구조 정규화
  // notion-client가 collection record 페이지 블록을
  // { value: { value: actualBlock, role } } 형태로 반환하는 경우 언래핑
  for (const blockId of Object.keys(blockMap)) {
    const entry = blockMap[blockId];
    if (
      entry?.value !== null &&
      typeof entry?.value === "object" &&
      "value" in entry.value &&
      "role" in entry.value &&
      typeof entry.value.value === "object"
    ) {
      entry.role = entry.value.role;
      entry.value = entry.value.value;
    }
  }

  // 1차: value.id 없는 블록에 키를 채워줌
  for (const blockId of Object.keys(blockMap)) {
    const entry = blockMap[blockId];
    if (entry?.value && entry.value.id == null) {
      entry.value.id = blockId;
    }
  }

  // 유효한 블록 ID 집합 재계산
  const validIds = new Set(
    Object.keys(blockMap).filter(
      (id) => blockMap[id]?.value?.id != null
    )
  );

  // 2차: content 배열에서 유효하지 않은 ID 제거
  for (const blockId of Object.keys(blockMap)) {
    const value = blockMap[blockId]?.value;
    if (!value) continue;

    if (Array.isArray(value.content)) {
      value.content = value.content.filter(
        (id: unknown): id is string =>
          typeof id === "string" && validIds.has(id)
      );
    }
  }

  return recordMap;
}
