import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = fileURLToPath(new URL('..', import.meta.url));
const cli = path.resolve(app, '../../packages/avanza-cli');
const output = path.resolve(app, 'content/docs/cli/reference');
const scratch = await mkdtemp(path.join(tmpdir(), 'avanza-cli-docs-'));

try {
  const readme = path.join(scratch, 'README.md');
  await writeFile(readme, '# Commands\n<!-- commands -->\n');
  await Promise.all(
    (await readdir(output))
      .filter((file) => file.endsWith('.md'))
      .map((file) => rm(path.join(output, file))),
  );

  execFileSync(
    process.execPath,
    [
      path.join(app, 'node_modules/oclif/bin/run.js'),
      'readme',
      '--multi',
      '--no-source-links',
      '--plugin-directory',
      cli,
      '--readme-path',
      readme,
      '--output-dir',
      path.relative(cli, output),
    ],
    { cwd: cli, stdio: 'inherit' },
  );

  const pages = (await readdir(output)).filter((file) => file.endsWith('.md'));
  if (pages.length === 0) throw new Error('oclif did not generate any topic pages.');
  await Promise.all(
    pages.map(async (file) => {
      const page = path.join(output, file);
      const body = (await readFile(page, 'utf8')).replace(/^.*\n=+\n\n/, '');
      const title = `avanza ${file.slice(0, -3)}`;
      await writeFile(page, `---\ntitle: ${JSON.stringify(title)}\n---\n\n${body}`);
    }),
  );
} finally {
  await rm(scratch, { recursive: true, force: true });
}
