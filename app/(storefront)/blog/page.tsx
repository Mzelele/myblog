import PostCard from "@/components/blog/post-card";
import { getBlogPosts } from "@/lib/storefront/blogs";
import { baseUrl } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog",
  description: "Read recent articles, guides, and updates.",
  alternates: { canonical: `${baseUrl}/blog` },
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { posts, totalPages } = await getBlogPosts({ page, limit: 9 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">Blog</h1>
        <p className="mt-3 text-neutral-600">Recent articles, guides, and updates.</p>
      </div>
      {posts.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id.toString()} post={post} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-neutral-600">No blog posts published yet.</p>
      )}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link className="rounded-md border border-neutral-200 px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50" href={`/blog?page=${page - 1}`}>
              Previous
            </Link>
          )}
          <span className="text-sm text-neutral-600">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link className="rounded-md border border-neutral-200 px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50" href={`/blog?page=${page + 1}`}>
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
