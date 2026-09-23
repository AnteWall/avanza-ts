import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Indices extends ApiRequestCommand {
  public static override summary = 'Read the header market indices';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Indices);
    await this.request(flags, (client) => client.market.headerIndices());
  }
}
