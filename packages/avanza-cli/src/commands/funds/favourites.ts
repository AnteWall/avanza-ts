import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Favourites extends ApiRequestCommand {
  public static override summary = 'List saved favourite funds';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Favourites);
    await this.request(flags, (client) => client.funds.favourites(), true);
  }
}
