import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class ExchangeRates extends ApiRequestCommand {
  public static override summary = 'List currency exchange rates';

  public async run(): Promise<void> {
    const { flags } = await this.parse(ExchangeRates);
    await this.request(flags, (client) => client.orders.exchangeRates(), true);
  }
}
