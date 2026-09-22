import { writeFile } from 'node:fs/promises';

import { Command, Flags } from '@oclif/core';

const outputFlags = {
  fields: Flags.string({
    description: 'Select comma-separated JSON fields (dotted paths for nested fields)',
    dependsOn: ['json'],
  }),
  fixture: Flags.boolean({
    description: 'Print the HTTP request and response as a fixture',
    exclusive: ['json'],
  }),
  json: Flags.boolean({
    description: 'Print the command response as JSON',
    exclusive: ['fixture'],
  }),
  output: Flags.string({
    description: 'Write the raw fixture to a new temporary file',
    dependsOn: ['fixture'],
  }),
};

interface OutputOptions {
  readonly fields: string | undefined;
  readonly fixture: boolean;
  readonly json: boolean | undefined;
  readonly output: string | undefined;
}

type Selection = Map<string, Selection | null>;

export function redactFields<Value>(value: Value, paths: readonly (readonly string[])[]): Value {
  const copy = structuredClone(value);
  for (const path of paths) {
    let current: unknown = copy;
    for (const segment of path.slice(0, -1)) {
      current =
        typeof current === 'object' && current !== null
          ? (current as Record<string, unknown>)[segment]
          : undefined;
    }
    if (typeof current === 'object' && current !== null && path.length > 0) {
      const record = current as Record<string, unknown>;
      const key = path.at(-1);
      if (key !== undefined && Object.hasOwn(record, key)) record[key] = '<redacted>';
    }
  }
  return copy;
}

export function selectJsonFields(value: unknown, fields: string): unknown {
  const paths = fields.split(',').map((field) => field.trim().split('.'));
  if (paths.some((path) => path.some((part) => part.length === 0))) {
    throw new TypeError('JSON fields must be a comma-separated list of field names.');
  }

  for (const path of paths) {
    if (!hasPath(value, path)) {
      throw new TypeError(`Unknown JSON field: ${path.join('.')}`);
    }
  }

  const selection: Selection = new Map();
  for (const path of paths) {
    let current = selection;
    for (const [index, part] of path.entries()) {
      if (index === path.length - 1) {
        current.set(part, null);
      } else {
        let child = current.get(part);
        if (child === null) break;
        if (child === undefined) {
          child = new Map();
          current.set(part, child);
        }
        current = child;
      }
    }
  }

  return project(value, selection);
}

function hasPath(value: unknown, path: readonly string[]): boolean {
  if (Array.isArray(value)) {
    return value.length === 0 || value.some((item: unknown) => hasPath(item, path));
  }
  if (typeof value !== 'object' || value === null || !Object.hasOwn(value, path[0]!)) {
    return false;
  }
  return path.length === 1 || hasPath((value as Record<string, unknown>)[path[0]!], path.slice(1));
}

function project(value: unknown, selection: Selection): unknown {
  if (Array.isArray(value)) return value.map((item: unknown) => project(item, selection));
  if (typeof value !== 'object' || value === null) return value;

  return Object.fromEntries(
    [...selection]
      .filter(([key]) => Object.hasOwn(value, key))
      .map(([key, child]) => [
        key,
        child === null
          ? (value as Record<string, unknown>)[key]
          : project((value as Record<string, unknown>)[key], child),
      ]),
  );
}

interface ApiResult {
  readonly human: () => void;
  readonly json: unknown;
  readonly fixture?: unknown;
  readonly redactions?: readonly (readonly string[])[];
}

export abstract class ApiCommand extends Command {
  public static override flags = outputFlags;

  protected async respond(flags: OutputOptions, result: ApiResult): Promise<void> {
    if (!flags.fixture && !flags.json) {
      result.human();
      return;
    }
    if (flags.fixture && result.fixture === undefined) {
      this.error('No JSON HTTP response was captured for this fixture.');
    }

    const redacted = flags.fixture ? undefined : redactFields(result.json, result.redactions ?? []);
    const data = flags.fixture
      ? result.fixture
      : flags.fields === undefined
        ? redacted
        : selectJsonFields(redacted, flags.fields);
    const serialized = `${JSON.stringify(data, null, 2)}\n`;
    if (flags.output !== undefined) {
      // ponytail: raw capture stays temporary; the api-fixtures skill anonymizes before tracking it.
      await writeFile(flags.output, serialized, { flag: 'wx', mode: 0o600 });
    } else {
      this.log(serialized.trimEnd());
    }
  }
}
