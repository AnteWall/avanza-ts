import { InstrumentsCommand } from '../../output/instruments-command.js';

export default class StockOptions extends InstrumentsCommand {
  public static override summary = 'Show available stock screener filters';

  public async run(): Promise<void> {
    const { flags } = await this.parse(StockOptions);
    await this.request(flags, (client) => client.instruments.getStockFilterOptions());
  }
}
