import { docs } from 'collections/server';
import { llms, loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

export function getPageMarkdownUrl(url: string): string {
  return `${process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? ''}/llms.mdx${url}/content.md`;
}

export const docsLlms = llms(source, {
  renderPage: async (page) => {
    const basePath = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? '';
    const text = await page.data.getText('processed');
    return `# ${page.data.title} (${basePath}${page.url})

${text.replaceAll('](/docs/', `](${basePath}/docs/`)}`;
  },
});
