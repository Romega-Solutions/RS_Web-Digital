import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { ArticleView } from "@/components/organisms/market-research/ArticleView";
import { getAllPosts, getArticle, getAuthorHref } from "@/lib/market-research";
import { absoluteUrl, createBreadcrumbSchema, createMetadata, siteConfig } from "@/lib/seo";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

// New posts from the portal appear within 5 minutes without a redeploy, and a
// post that is unpublished there disappears just as quickly. Same as Careers.
export const revalidate = 300;

// Slugs the build knows about are prerendered; a slug published later is
// rendered on first visit. A slug that is not a published post returns 404.
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Not found", robots: { index: false, follow: false } };
  const { post } = article;

  const base = createMetadata({
    title: post.title,
    description: post.summary,
    path: `/market-research/${post.slug}`,
    image: post.cover.src,
    keywords: ["market research", ...post.authors.map((author) => author.name)],
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
      authors: post.authors.map((author) => author.name),
      images: [
        {
          url: absoluteUrl(post.cover.src),
          // Portal covers do not store a size, so only declare one when known.
          ...(post.cover.width && post.cover.height
            ? { width: post.cover.width, height: post.cover.height }
            : {}),
          ...(post.cover.alt ? { alt: post.cover.alt } : {}),
        },
      ],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound(); // missing, unpublished or deleted
  const { post, body } = article;

  const authors = post.authors.map((author) => ({
    name: author.name,
    href: getAuthorHref(author),
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Market Research", path: "/market-research" },
        { name: post.title, path: `/market-research/${post.slug}` },
      ]),
      {
        "@type": "Article",
        "@id": absoluteUrl(`/market-research/${post.slug}#article`),
        mainEntityOfPage: absoluteUrl(`/market-research/${post.slug}`),
        headline: post.title,
        description: post.summary,
        datePublished: post.publishedAt,
        ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
        image: absoluteUrl(post.cover.src),
        author: authors.map((author) => ({
          "@type": "Person",
          name: author.name,
          ...(author.href ? { url: author.href } : {}),
        })),
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          logo: { "@type": "ImageObject", url: absoluteUrl(siteConfig.logo) },
        },
        isPartOf: { "@id": absoluteUrl("/#website") },
      },
    ],
  };

  let content: React.ReactNode;
  if (body.kind === "html") {
    // body.html was sanitized in getArticle (sanitize-html allowlist), so it
    // is safe to render.
    content = <div dangerouslySetInnerHTML={{ __html: body.html }} />;
  } else {
    const { default: MdxBody } = await import(`@/content/market-research/${slug}.mdx`);
    content = <MdxBody />;
  }

  return (
    <MainTemplate
      jsonLd={<JsonLd id="market-research-article-structured-data" data={structuredData} />}
      header={<SiteHeader activeItem="Market Research" />}
      footer={<SiteFooter />}
    >
      <ArticleView post={post} authors={authors}>
        {content}
      </ArticleView>
    </MainTemplate>
  );
}
