import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Trading extends ApiRequestCommand {
  public static override summary = 'Read trading accounts';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Trading);
    await this.request(flags, (client) => client.accounts.tradingAccounts(), true);
  }
}
