export interface HeadingItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

export function extractHeadings(recordMap: any): HeadingItem[] {
  if (!recordMap?.block) return [];

  const pageBlock = Object.values(recordMap.block as Record<string, any>).find(
    (b) => b?.value?.type === "page"
  );
  if (!pageBlock?.value?.content) return [];

  const headings: HeadingItem[] = [];

  function traverse(blockIds: string[]) {
    for (const blockId of blockIds) {
      const blockData = recordMap.block[blockId];
      if (!blockData?.value) continue;
      const block = blockData.value;

      let level: 1 | 2 | 3 | null = null;
      if (block.type === "header") level = 1;
      else if (block.type === "sub_header") level = 2;
      else if (block.type === "sub_sub_header") level = 3;

      if (level !== null) {
        const titleProp = block.properties?.title;
        const text = titleProp
          ? titleProp.map((chunk: any[]) => chunk[0]).join("")
          : "";
        if (text) {
          headings.push({ id: blockId.replace(/-/g, ""), text, level });
        }
      }

      if (block.content) {
        traverse(block.content);
      }
    }
  }

  traverse(pageBlock.value.content);
  return headings;
}
