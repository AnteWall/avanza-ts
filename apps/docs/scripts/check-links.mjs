import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../out/', import.meta.url));
const basePath = process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? '';
const pages = readdirSync(out, { recursive: true }).filter((file) => file.endsWith('.html'));
const failures = [];

for (const file of pages) {
  const html = readFileSync(path.join(out, file), 'utf8');
  const pageUrl = new URL(`${basePath}/${file.replace(/index\.html$/, '')}`, 'https://docs.test');

  for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
    const target = new URL(href.replaceAll('&amp;', '&'), pageUrl);
    if (target.origin !== pageUrl.origin || target.pathname.includes('/_next/')) continue;
    if (!target.pathname.startsWith(`${basePath}/`)) {
      failures.push(`${file}: ${href} (outside site)`);
      continue;
    }

    const pathname = decodeURIComponent(target.pathname.slice(basePath.length + 1));
    const targetFile = path.join(out, pathname);
    const candidate =
      existsSync(targetFile) && statSync(targetFile).isFile()
        ? targetFile
        : path.join(targetFile, 'index.html');
    if (!existsSync(candidate)) {
      failures.push(`${file}: ${href} (missing page)`);
      continue;
    }
    if (target.hash && candidate.endsWith('.html')) {
      const id = decodeURIComponent(target.hash.slice(1));
      if (!readFileSync(candidate, 'utf8').includes(`id="${id}"`)) {
        failures.push(`${file}: ${href} (missing anchor)`);
      }
    }
  }
}

const llmsIndex = readFileSync(path.join(out, 'llms.txt'), 'utf8');
const markdownLinks = [...llmsIndex.matchAll(/\]\(([^)]+\.md)\)/g)];
if (markdownLinks.length === 0 || statSync(path.join(out, 'llms-full.txt')).size === 0) {
  failures.push('LLM documentation is empty');
}
for (const [, href] of markdownLinks) {
  const target = new URL(href, 'https://docs.test');
  const pathname = decodeURIComponent(target.pathname.slice(basePath.length + 1));
  if (!target.pathname.startsWith(`${basePath}/`)) {
    failures.push(`llms.txt: ${href} (outside site)`);
  } else if (!existsSync(path.join(out, pathname))) {
    failures.push(`llms.txt: ${href} (missing Markdown page)`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked links in ${pages.length} exported pages.`);
}
