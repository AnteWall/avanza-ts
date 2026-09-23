import { Flags } from '@oclif/core';
import { watchlistDataPoints } from 'avanza-ts';

import { ApiRequestCommand } from '../../output/api-request-command.js';
import { watchlistFlags, watchlistOrderbookIds } from '../../output/watchlist-flags.js';

export default class WatchlistData extends ApiRequestCommand {
  public static override summary = 'Read quotes and selected data points for a watchlist';
  public static override flags = {
    ...ApiRequestCommand.flags,
    ...watchlistFlags,
    'data-points': Flags.option({ options: watchlistDataPoints, multiple: true, delimiter: ',' })({
      default: ['LAST_PRICE'],
      description: 'Data points to include',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(WatchlistData);
    await this.request(
      flags,
      async (client) =>
        client.collections.watchlistData(
          flags['watchlist-id'],
          await watchlistOrderbookIds(client, flags),
          flags['data-points'],
        ),
      true,
    );
  }
}
