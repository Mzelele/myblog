import PostCard from "@/components/blog/post-card";
import Prose from "@/components/prose";
import { formatPostDate, getBlogPost, getLatestPosts, readingTime } from "@/lib/storefront/blogs";
import { baseUrl } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return notFound();
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : undefined,
      type: "article",
      publishedTime: post.publishedAt?.toString(),
      authors: post.author ? [post.author] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return notFound();

  const related = await getLatestPosts(3, post.slug);
  const published = post.publishedAt || post.createdAt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.featuredImage ? [post.featuredImage] : undefined,
    datePublished: new Date(published).toISOString(),
    dateModified: new Date(post.updatedAt || published).toISOString(),
    author: { "@type": "Person", name: post.author || "Editorial Team" },
    mainEntityOfPage: `${baseUrl}/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <article className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            {formatPostDate(published, true)} · {readingTime(post.content)} min read
            {post.author ? ` · By ${post.author}` : ""}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">{post.title}</h1>
          {post.excerpt ? <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">{post.excerpt}</p> : null}
        </div>
        {post.featuredImage ? (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
            <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <Prose className="max-w-none" html={post.content} />

        <div className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 text-center">
          <p className="text-lg font-semibold text-neutral-900">Like what you read?</p>
          <p className="mt-1 text-sm text-neutral-600">See what&apos;s currently in the shop.</p>
          <Link href="/shop" className="mt-4 inline-block rounded-md bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700">
            Browse the shop
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">Keep reading</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p._id.toString()} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
