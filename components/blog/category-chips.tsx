import { BLOG_CATEGORIES } from "@/lib/blog-categories";
import Link from "next/link";

export default function CategoryChips({ active }: { active?: string }) {
  const base = "rounded-full border px-4 py-1.5 text-sm font-medium transition";
  const on = "border-neutral-900 bg-neutral-900 text-white";
  const off = "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400";
  return (
    <nav aria-label="Blog categories" className="mb-8 flex flex-wrap justify-center gap-2">
      <Link href="/blog" className={`${base} ${!active ? on : off}`}>
        All
      </Link>
      {BLOG_CATEGORIES.map((c) => (
        <Link key={c.slug} href={`/blog/category/${c.slug}`} className={`${base} ${active === c.slug ? on : off}`}>
          {c.name}
        </Link>
      ))}
    </nav>
  );
}
