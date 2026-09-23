import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Watchlists extends ApiRequestCommand {
  public static override summary = 'List watchlists';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Watchlists);
    await this.request(flags, (client) => client.collections.watchlists(), true);
  }
}
