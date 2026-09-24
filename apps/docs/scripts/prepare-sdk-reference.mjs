import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../content/docs/sdk/reference/generated/', import.meta.url));
const pages = (await readdir(output, { recursive: true })).filter((file) => file.endsWith('.md'));
if (!pages.includes('index.md') || !pages.includes('classes/AvanzaClient.md')) {
  throw new Error('TypeDoc did not generate the SDK public API reference.');
}

await Promise.all(
  pages.map(async (file) => {
    const filename = path.join(output, file);
    const content = await readFile(filename, 'utf8');
    const match = /^# (.+)\n/.exec(content);
    if (!match) throw new Error(`Missing TypeDoc page title: ${file}`);
    const title = file === 'index.md' ? 'Exported API' : match[1];
    // Fumadocs resolves ./ and ../ file links; TypeDoc omits ./ for same-directory links.
    const body = content
      .slice(match[0].length)
      .trimStart()
      .replace(/\]\(([^)]+\.md(?:#[^)]+)?)\)/g, (link, target) =>
        target.startsWith('./') || target.startsWith('../') || target.includes('://')
          ? link
          : `](./${target})`,
      );
    await writeFile(filename, `---\ntitle: ${JSON.stringify(title)}\n---\n\n${body}`);
  }),
);
await writeFile(output + 'meta.json', '{"title":"All exports","pages":["index"]}\n');
