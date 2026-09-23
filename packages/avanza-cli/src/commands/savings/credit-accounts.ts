import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class CreditAccounts extends ApiRequestCommand {
  public static override summary = 'List accounts available for securities credit';

  public async run(): Promise<void> {
    const { flags } = await this.parse(CreditAccounts);
    await this.request(flags, (client) => client.savings.creditAccounts(), true);
  }
}
