import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Offers extends ApiRequestCommand {
  public static override summary = 'List current offers, such as share issues and IPOs';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Offers);
    await this.request(flags, (client) => client.news.offers(), true);
  }
}
