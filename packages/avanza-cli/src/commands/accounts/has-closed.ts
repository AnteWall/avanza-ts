import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class HasClosed extends ApiRequestCommand {
  public static override summary = 'Check whether any accounts have been closed';

  public async run(): Promise<void> {
    const { flags } = await this.parse(HasClosed);
    await this.request(flags, (client) => client.accounts.hasClosed(), true);
  }
}
