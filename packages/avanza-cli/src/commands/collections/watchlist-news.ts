import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';
import { watchlistFlags, watchlistOrderbookIds } from '../../output/watchlist-flags.js';

export default class WatchlistNews extends ApiRequestCommand {
  public static override summary = 'List news for instruments in a watchlist';
  public static override flags = {
    ...ApiRequestCommand.flags,
    ...watchlistFlags,
    categories: Flags.string({ description: 'Comma-separated news categories' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(WatchlistNews);
    await this.request(
      flags,
      async (client) =>
        client.collections.watchlistNews(await watchlistOrderbookIds(client, flags), {
          categories: flags.categories?.split(','),
        }),
      true,
    );
  }
}
