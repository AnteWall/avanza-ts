import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Periodic extends ApiRequestCommand {
  public static override summary = 'List monthly fund savings';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Periodic);
    await this.request(flags, (client) => client.savings.periodicSavings(), true);
  }
}
