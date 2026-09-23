import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Categories extends ApiRequestCommand {
  public static override summary = 'List account categories';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Categories);
    await this.request(flags, (client) => client.accounts.categories(), true);
  }
}
