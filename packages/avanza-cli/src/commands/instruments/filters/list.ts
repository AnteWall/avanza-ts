import { InstrumentsCommand } from '../../../output/instruments-command.js';

export default class List extends InstrumentsCommand {
  public static override summary = 'List saved stock screener filters';

  public async run(): Promise<void> {
    const { flags } = await this.parse(List);
    await this.request(flags, (client) => client.instruments.getSavedStockFilters(), true);
  }
}
