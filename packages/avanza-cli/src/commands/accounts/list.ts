import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class List extends ApiRequestCommand {
  public static override summary = 'List open accounts';

  public async run(): Promise<void> {
    const { flags } = await this.parse(List);
    await this.request(flags, (client) => client.accounts.list(), true);
  }
}
