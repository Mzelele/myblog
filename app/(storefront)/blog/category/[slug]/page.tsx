import CategoryChips from "@/components/blog/category-chips";
import PostCard from "@/components/blog/post-card";
import { getCategory } from "@/lib/blog-categories";
import { getBlogPosts } from "@/lib/storefront/blogs";
import { baseUrl } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: `${category.name} Articles`,
    description: category.description,
    alternates: { canonical: `${baseUrl}/blog/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { posts, totalPages } = await getBlogPosts({ page, limit: 9, category: category.slug });
  const base = `/blog/category/${category.slug}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">{category.name}</h1>
        <p className="mt-3 text-neutral-600">{category.description}</p>
      </div>
      <CategoryChips active={category.slug} />
      {posts.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id.toString()} post={post} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-neutral-600">No articles in this category yet.</p>
      )}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link className="rounded-md border border-neutral-200 px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50" href={`${base}?page=${page - 1}`}>
              Previous
            </Link>
          )}
          <span className="text-sm text-neutral-600">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link className="rounded-md border border-neutral-200 px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50" href={`${base}?page=${page + 1}`}>
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
