import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class TopTen extends ApiRequestCommand {
  public static override summary = 'List the top ten funds by a sort field';
  public static override flags = {
    ...ApiRequestCommand.flags,
    'sort-field': Flags.string({ description: 'Sort field, for example developmentOneYear' }),
    order: Flags.option({ options: ['asc', 'desc'] as const })({ description: 'Sort order' }),
    type: Flags.option({ options: ['FUND', 'EXCHANGE_TRADED_FUND', 'BOTH'] as const })({
      default: 'FUND',
      description: 'Instrument type',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(TopTen);
    await this.request(flags, (client) =>
      client.funds.topTen({
        sortField: flags['sort-field'],
        sortDirection:
          flags.order === undefined
            ? undefined
            : flags.order === 'asc'
              ? 'ASCENDING'
              : 'DESCENDING',
        fundInstrumentType: flags.type,
      }),
    );
  }
}
