import { Flags } from '@oclif/core';
import { yearChartSeries } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class YearChart extends ApiRequestCommand {
  public static override summary = 'Read a yearly summary chart series';
  public static override flags = {
    ...ApiRequestCommand.flags,
    series: Flags.option({ options: yearChartSeries, default: 'relative' as const })({
      description:
        'relative: return this year; relative-from-start: since start; value: account value',
    }),
    year: Flags.integer({ default: new Date().getFullYear(), description: 'Calendar year' }),
    'account-ids': Flags.string({
      multiple: true,
      delimiter: ',',
      description: 'Comma-separated account IDs; defaults to all accounts',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(YearChart);
    await this.request(
      flags,
      (client) => client.performance.yearChart(flags.year, flags.series, flags['account-ids']),
      true,
    );
  }
}
