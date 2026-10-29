import { Flags } from '@oclif/core';
import { yearBenchmarkIndices } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class YearBenchmark extends ApiRequestCommand {
  public static override summary = 'Read a benchmark index development for a year';
  public static override flags = {
    ...ApiRequestCommand.flags,
    index: Flags.option({ options: yearBenchmarkIndices, default: 'omx' as const })({
      description: 'omx: OMXS30 GI; usa: Dow Jones US',
    }),
    year: Flags.integer({ default: new Date().getFullYear(), description: 'Calendar year' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(YearBenchmark);
    await this.request(
      flags,
      (client) => client.performance.yearBenchmark(flags.year, flags.index),
      true,
    );
  }
}
