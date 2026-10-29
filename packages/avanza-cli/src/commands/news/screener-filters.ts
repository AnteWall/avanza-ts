import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class ScreenerFilters extends ApiRequestCommand {
  public static override summary =
    'List news screener filters; account and watchlist filters need a session';
  public static override flags = { ...ApiRequestCommand.flags };

  public async run(): Promise<void> {
    const { flags } = await this.parse(ScreenerFilters);
    await this.request(flags, (client) => client.news.screenerFilters(), 'optional');
  }
}
