import { createMDX } from 'fumadocs-mdx/next';

const basePath = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? '';

export default createMDX()({
  output: 'export',
  basePath,
  trailingSlash: true,
});
