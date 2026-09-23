import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class TradingWithPositions extends ApiRequestCommand {
  public static override summary = 'Read trading accounts with positions';

  public async run(): Promise<void> {
    const { flags } = await this.parse(TradingWithPositions);
    await this.request(flags, (client) => client.accounts.accountsAndPositions(), true);
  }
}
