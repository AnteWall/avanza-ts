import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class StockOptions extends ApiRequestCommand {
  public static override summary = 'Show available stock screener filters';

  public async run(): Promise<void> {
    const { flags } = await this.parse(StockOptions);
    await this.request(flags, (client) => client.instruments.getStockFilterOptions());
  }
}
