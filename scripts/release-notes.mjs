import { readFileSync } from 'node:fs';

const [name, version] = process.argv.slice(2);
const changelog = readFileSync(`packages/${name}/CHANGELOG.md`, 'utf8');
const sections = changelog.split(/^## /m);
const section = sections.find(
  (entry) => entry.startsWith(`${version}\n`) || entry.startsWith(`${version} `),
);

if (!section) throw new Error(`No changelog entry for ${name}@${version}`);

process.stdout.write(section.slice(section.indexOf('\n') + 1).trim() + '\n');
