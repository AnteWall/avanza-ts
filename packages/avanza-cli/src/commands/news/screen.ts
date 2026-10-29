import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

const ids = (description: string) =>
  Flags.string({ multiple: true, delimiter: ',', description: `Comma-separated ${description}` });

export default class Screen extends ApiRequestCommand {
  public static override summary = 'Screen market news by company, sector, type, or source';
  public static override flags = {
    ...ApiRequestCommand.flags,
    companies: ids('orderbook IDs'),
    accounts: ids('account IDs; requires a session'),
    watchlists: ids('watchlist IDs; requires a session'),
    'news-types': ids('news type IDs from news screener-filters'),
    sectors: ids('sector IDs from news screener-filters'),
    marketplaces: ids('marketplace IDs from news screener-filters'),
    sources: ids('source IDs from news screener-filters'),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Screen);
    await this.request(
      flags,
      (client) =>
        client.news.screen({
          companies: flags.companies,
          accounts: flags.accounts,
          watchlists: flags.watchlists,
          newsTypes: flags['news-types'],
          sectors: flags.sectors,
          marketplaces: flags.marketplaces,
          sources: flags.sources,
        }),
      flags.accounts !== undefined || flags.watchlists !== undefined,
    );
  }
}
