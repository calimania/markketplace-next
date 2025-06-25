import { type Page } from '@/markket/page.d';
import { Card, Group, Text, Title, Badge } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import './pages.list.css';

type PageListProps = {
  pages: Page[];
  storeSlug?: string;
};

const excluded_list = ['docs', 'blog', 'newsletter', 'events', 'about', 'products'];

export const PageList = ({ pages, storeSlug}: PageListProps) => {
  return (
    <div className="space-y-4">
      {pages.map((page) => (
        <Link
          key={page.id}
          href={`/store/${storeSlug}/${!excluded_list.includes(page.slug) ? 'about/' : ''}${page.slug}`}
          className="no-underline block"
        >
          <Card
            withBorder
            padding="0"
            radius="md"
            className="page-list-card overflow-hidden"
            style={{
              borderWidth: 3,
              borderColor: '#222',
              borderStyle: 'solid',
              boxShadow: '6px 6px 0 #222',
              background: '#fffbe6',
              transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s, transform 0.2s',
              display: ['home', 'receipt'].includes(page.slug) ? 'none' : 'block'
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-0">
              <div className="sm:col-span-4">
                {page?.SEO?.socialImage?.url ? (
                  <div className="h-full page-list-img-wrap">
                    <img
                      src={page.SEO.socialImage.url}
                      alt={page.Title || 'Page thumbnail'}
                      className="w-full h-full object-cover min-h-[200px] page-list-img"
                      style={{ objectFit: 'cover', objectPosition: 'top', width: '100%', height: '100%', transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)' }}
                    />
                  </div>
                ) : (
                  <div className="h-full min-h-[200px] bg-gray-100 flex items-center justify-center">
                    <Text c="dimmed" size="sm">No image available</Text>
                  </div>
                )}
              </div>

              <div className="sm:col-span-8">
                <div className="p-6 flex flex-col h-full">
                  <Group justify="space-between" mb="xs">
                    <Badge
                      variant="light"
                      size="sm"
                      className="tracking-wider"
                    >
                      {page.menuOrder ? `0${page.menuOrder}` : 'Featured'}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {new Date(page.publishedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </Group>

                  <Title order={3} className="mb-3 leading-tight page-list-title">
                    {page.Title || 'Untitled Page'}
                  </Title>

                  {page.SEO?.metaDescription && (
                    <Text
                      size="sm"
                      className="mb-4 leading-relaxed page-list-desc"
                      style={{ fontWeight: 600, fontFamily: 'monospace', background: '#181818', color: '#fff', padding: '0.7em', borderRadius: 6, border: '2px dashed #222', letterSpacing: 0.2 }}
                      lineClamp={2}
                    >
                      {page.SEO.metaDescription}
                    </Text>
                  )}

                  <Group justify="space-between" className="mt-auto pt-4 border-t border-gray-100 page-list-footer">
                    <Text size="sm" c="dimmed">
                      {page.SEO?.metaAuthor || 'Markket.place'}
                    </Text>
                    <Text
                      size="sm"
                      c="blue"
                      className="flex items-center gap-1 font-medium page-list-read"
                    >
                      Read article <IconArrowRight size={14} />
                    </Text>
                  </Group>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
