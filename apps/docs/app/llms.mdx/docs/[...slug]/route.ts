import { notFound } from 'next/navigation';

import { docsLlms, source } from '@/lib/source';

export const revalidate = false;

export async function GET(_request: Request, { params }: RouteContext<'/llms.mdx/docs/[...slug]'>) {
  const { slug } = await params;
  if (slug.at(-1) !== 'content.md') notFound();
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new Response(await docsLlms.page(page), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}

export function generateStaticParams() {
  return source.generateParams().map(({ slug }) => ({ slug: [...slug, 'content.md'] }));
}
