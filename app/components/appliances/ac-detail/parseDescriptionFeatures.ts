/** Extract bullet points from seeded HTML descriptions (SSR-safe regex fallback). */
export function parseDescriptionListItems(html: string): string[] {
  const items: string[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = liRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (text) items.push(text);
  }
  return items;
}

/** Strip list markup so the prose block shows intro paragraph only. */
export function stripListFromHtml(html: string): string {
  return html
    .replace(/<ul[\s\S]*?<\/ul>/gi, "")
    .replace(/<ol[\s\S]*?<\/ol>/gi, "")
    .trim();
}
