import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Alerts extends ApiRequestCommand {
  public static override summary = 'List price, percent, and news alerts';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Alerts);
    await this.request(flags, (client) => client.collections.alerts(), true);
  }
}
