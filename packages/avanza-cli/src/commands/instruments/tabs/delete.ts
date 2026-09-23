import { ApiRequestCommand } from '../../../output/api-request-command.js';

export default class Delete extends ApiRequestCommand {
  public static override summary = 'Delete all saved stock screener tabs';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Delete);
    await this.request(flags, (client) => client.instruments.deleteStockScreenerTabs(), true);
  }
}
