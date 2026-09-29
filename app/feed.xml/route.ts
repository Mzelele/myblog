import { getBlogPosts } from "@/lib/storefront/blogs";
import { getStoreSettings } from "@/lib/storefront/settings";
import { baseUrl } from "@/lib/utils";

export const revalidate = 600;

const esc = (s: string) =>
  (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const [{ posts }, settings] = await Promise.all([getBlogPosts({ page: 1, limit: 30 }), getStoreSettings()]);

  const items = posts
    .map((p) => {
      const url = `${baseUrl}/blog/${p.slug}`;
      return `<item>
<title>${esc(p.title)}</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<pubDate>${new Date(p.publishedAt || p.createdAt).toUTCString()}</pubDate>
<description>${esc(p.excerpt || p.metaDescription)}</description>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(settings.storeName || "Blog")}</title>
<link>${baseUrl}</link>
<description>${esc(settings.metaDescription || "Latest articles")}</description>
${items}
</channel></rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
