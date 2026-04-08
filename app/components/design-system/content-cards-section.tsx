import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Article } from '@/markket/article';
import type { Page } from '@/markket/page';
import SpecimenTag from '@/app/components/design-system/specimen-tag';

type ContentCardsSectionProps = {
  storeSlug: string;
  posts: Article[];
  pages: Page[];
};

const sectionStyle: CSSProperties = {
  marginBottom: 56,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 14,
};

const cardStyle: CSSProperties = {
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  background: '#ffffff',
  overflow: 'hidden',
  boxShadow: '0 12px 24px rgba(2, 8, 23, 0.09)',
};

const coverStyle: CSSProperties = {
  height: 160,
  width: '100%',
  objectFit: 'cover',
  objectPosition: 'center center',
  display: 'block',
  background: '#f1f5f9',
};

const bodyStyle: CSSProperties = {
  padding: 14,
};

const titleStyle: CSSProperties = {
  margin: '10px 0 6px',
  color: '#0f172a',
  fontWeight: 900,
  fontSize: '1.15rem',
  lineHeight: 1.2,
  letterSpacing: '-0.01em',
};

const excerptStyle: CSSProperties = {
  margin: 0,
  color: '#475569',
  lineHeight: 1.5,
  minHeight: 44,
};

const ctaStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  marginTop: 12,
  borderRadius: 999,
  border: '1px solid #cbd5e1',
  padding: '6px 12px',
  fontSize: '0.74rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#1e293b',
  textDecoration: 'none',
};

function description(value?: string) {
  if (!value) return 'No description provided yet.';
  return value.length > 120 ? `${value.slice(0, 117)}...` : value;
}

export default function ContentCardsSection({ storeSlug, posts, pages }: ContentCardsSectionProps) {
  const safePosts = posts.slice(0, 3);
  const safePages = pages.slice(0, 3);
  const hasCards = safePosts.length > 0 || safePages.length > 0;

  return (
    <section style={sectionStyle}>
      <div style={{ marginBottom: 14 }}>
        <SpecimenTag color="#0e7490">Specimen SC-005 / Store Content Cards</SpecimenTag>
      </div>

      {!hasCards ? (
        <div style={{ ...cardStyle, padding: 18, borderStyle: 'dashed' }}>
          <p style={{ margin: 0, color: '#475569' }}>
            No blog posts or custom pages yet. Once content is published, preview cards will render here.
          </p>
        </div>
      ) : (
        <div style={gridStyle}>
          {safePosts.map((post) => {
            const href = `/${storeSlug}/blog/${post.slug}`;
            const image = post?.cover?.formats?.small?.url || post?.cover?.url;

            return (
              <article key={`post-${post.id}`} style={cardStyle}>
                {image ? (
                  <img src={image} alt={post.Title} loading="lazy" style={coverStyle} />
                ) : (
                  <div style={{ ...coverStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700 }}>
                    No image
                  </div>
                )}
                <div style={bodyStyle}>
                  <SpecimenTag color="#db2777">Blog Post</SpecimenTag>
                  <h3 style={titleStyle}>{post.Title || 'Untitled Post'}</h3>
                  <p style={excerptStyle}>{description(post?.SEO?.metaDescription)}</p>
                  <Link href={href} style={ctaStyle}>
                    View post
                  </Link>
                </div>
              </article>
            );
          })}

          {safePages.map((page) => {
            const href = `/${storeSlug}/about/${page.slug}`;
            const image = page?.SEO?.socialImage?.formats?.small?.url || page?.SEO?.socialImage?.url;

            return (
              <article key={`page-${page.id}`} style={cardStyle}>
                {image ? (
                  <img src={image} alt={page.Title} loading="lazy" style={coverStyle} />
                ) : (
                  <div style={{ ...coverStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700 }}>
                    No image
                  </div>
                )}
                <div style={bodyStyle}>
                  <SpecimenTag color="#0f766e">Page</SpecimenTag>
                  <h3 style={titleStyle}>{page.Title || 'Untitled Page'}</h3>
                  <p style={excerptStyle}>{description(page?.SEO?.metaDescription)}</p>
                  <Link href={href} style={ctaStyle}>
                    View page
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}