import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class TriggeredAlerts extends ApiRequestCommand {
  public static override summary = 'List triggered alerts';

  public async run(): Promise<void> {
    const { flags } = await this.parse(TriggeredAlerts);
    await this.request(flags, (client) => client.collections.triggeredAlerts(), true);
  }
}
