import { docsLlms, getPageMarkdownUrl } from '@/lib/source';

export const revalidate = false;

export async function GET() {
  const index = (await docsLlms.index()).replaceAll(
    /\]\((\/docs(?:\/[^)]*)?)\)/g,
    (_match, url: string) => `](${getPageMarkdownUrl(url)})`,
  );
  return new Response(index, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
