// Keep generateMetadata in a separate server component
export { generateMetadata } from './metadata';

import BlogPostPage from '@/app/components/blog.details';

export default function BlogPostPageContainer({
  params: { id, slug }
}: {
  params: { id: string; slug: string }
}) {
  return <BlogPostPage params={{ id, slug }} />;
};
