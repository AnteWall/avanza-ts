import { Flags } from '@oclif/core';
import { searchInstrumentTypes } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Search extends ApiRequestCommand {
  public static override summary = 'Search instruments by name, ticker, or ISIN';
  public static override flags = {
    ...ApiRequestCommand.flags,
    query: Flags.string({ required: true, description: 'Search text' }),
    types: Flags.option({ options: searchInstrumentTypes, multiple: true, delimiter: ',' })({
      description: 'Comma-separated instrument types; defaults to all',
    }),
    offset: Flags.integer({ default: 0, min: 0 }),
    limit: Flags.integer({ min: 1 }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Search);
    await this.request(flags, (client) =>
      client.market.search(flags.query, {
        types: flags.types,
        from: flags.offset,
        size: flags.limit,
      }),
    );
  }
}
