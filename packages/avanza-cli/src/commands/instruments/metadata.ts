import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Metadata extends ApiRequestCommand {
  public static override summary = 'Show signed-in stock screener metadata';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Metadata);
    await this.request(flags, (client) => client.instruments.getStockScreenerMetadata(), true);
  }
}
