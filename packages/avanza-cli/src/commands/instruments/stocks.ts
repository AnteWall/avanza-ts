import { Flags } from '@oclif/core';
import { stockFilterSchema, type StockFilter } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Stocks extends ApiRequestCommand {
  public static override summary = 'Screen stocks by filter, sort order, and page';
  public static override flags = {
    ...ApiRequestCommand.flags,
    filter: Flags.string({ description: 'Stock filter as JSON' }),
    offset: Flags.integer({ default: 0, min: 0 }),
    limit: Flags.integer({ default: 20, min: 1 }),
    'sort-field': Flags.string({ default: 'numberOfOwners' }),
    order: Flags.string({ options: ['asc', 'desc'], default: 'desc' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Stocks);
    let filter: StockFilter | undefined;
    if (flags.filter !== undefined) {
      try {
        filter = stockFilterSchema.parse(JSON.parse(flags.filter) as unknown);
      } catch {
        this.error('--filter must be a JSON object.');
      }
    }
    await this.request(flags, (client) =>
      client.instruments.screenStocks({
        ...(filter === undefined ? {} : { filter }),
        offset: flags.offset,
        limit: flags.limit,
        sortBy: { field: flags['sort-field'], order: flags.order === 'asc' ? 'asc' : 'desc' },
      }),
    );
  }
}
