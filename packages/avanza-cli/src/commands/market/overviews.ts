import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Overviews extends ApiRequestCommand {
  public static override summary = 'Read market overview layouts';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Overviews);
    await this.request(flags, (client) => client.market.overviews());
  }
}
