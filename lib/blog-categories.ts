export type BlogCategory = { slug: string; name: string; description: string };

export const BLOG_CATEGORIES: BlogCategory[] = [
  { slug: "wellness", name: "Wellness", description: "Hormones, cycle health, sleep, stress and everyday energy." },
  { slug: "libido-intimacy", name: "Libido & Intimacy", description: "Desire, relationships and pelvic health, explained clearly." },
  { slug: "beauty", name: "Beauty", description: "Skin, hair and nails, from the inside out." },
  { slug: "supplements", name: "Supplements", description: "Ingredient guides and what the evidence actually says." },
];

export function getCategory(slug?: string | null) {
  return BLOG_CATEGORIES.find((c) => c.slug === slug);
}

export function normalizeTags(input: unknown): string[] {
  const raw = Array.isArray(input) ? input : typeof input === "string" ? input.split(",") : [];
  const seen = new Set<string>();
  for (const t of raw) {
    const v = String(t).trim().toLowerCase().replace(/\s+/g, " ").slice(0, 40);
    if (v) seen.add(v);
  }
  return Array.from(seen).slice(0, 10);
}
