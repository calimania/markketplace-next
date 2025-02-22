import { type Page } from '@/markket/page.d';
import { Card, Group,  Text, Title, Badge } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';

type PageListProps = {
  pages: Page[];
  storeSlug?: string;
};

export const PageList = ({ pages, storeSlug}: PageListProps) => {
  return (
    <div className="space-y-4">
      {pages.map((page) => (
        <Link
          key={page.id}
          href={`/store/${storeSlug}/about/${page.slug}`}
          className="no-underline block"
        >
          <Card
            withBorder
            padding="0"
            radius="md"
            className="transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-0">
              <div className="sm:col-span-4">
                {page?.SEO?.socialImage?.url ? (
                  <div className="h-full">
                    <img
                      src={page.SEO.socialImage.url}
                      alt={page.Title || 'Page thumbnail'}
                      className="w-full h-full object-cover min-h-[200px]"
                    />
                  </div>
                ) : (
                  <div className="h-full min-h-[200px] bg-gray-100 flex items-center justify-center">
                    <Text c="dimmed" size="sm">No image available</Text>
                  </div>
                )}
              </div>

              <div className="sm:col-span-8">
                <div className="p-6">
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

                  <Title order={3} className="mb-3 leading-tight">
                    {page.Title || 'Untitled Page'}
                  </Title>

                  {page.SEO?.metaDescription && (
                    <Text
                      size="sm"
                      c="dimmed"
                      lineClamp={2}
                      className="mb-4 leading-relaxed"
                    >
                      {page.SEO.metaDescription}
                    </Text>
                  )}

                  <Group justify="space-between" className="mt-auto pt-4 border-t border-gray-100">
                    <Text size="sm" c="dimmed">
                      {page.SEO?.metaAuthor || 'Markket.place'}
                    </Text>
                    <Text
                      size="sm"
                      c="blue"
                      className="flex items-center gap-1 font-medium"
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
