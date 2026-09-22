import { writeFile } from 'node:fs/promises';

import { Command, Flags } from '@oclif/core';

const outputFlags = {
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
  readonly fixture: boolean;
  readonly json: boolean | undefined;
  readonly output: string | undefined;
}

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

    const data = flags.fixture
      ? result.fixture
      : redactFields(result.json, result.redactions ?? []);
    const serialized = `${JSON.stringify(data, null, 2)}\n`;
    if (flags.output !== undefined) {
      // ponytail: raw capture stays temporary; the api-fixtures skill anonymizes before tracking it.
      await writeFile(flags.output, serialized, { flag: 'wx', mode: 0o600 });
    } else {
      this.log(serialized.trimEnd());
    }
  }
}
