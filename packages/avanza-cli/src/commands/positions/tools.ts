import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Tools extends ApiRequestCommand {
  public static override summary = 'Read active position tools';

  public async run(): Promise<void> {
    const { flags } = await this.parse(Tools);
    await this.request(flags, (client) => client.positions.activeTools(), true);
  }
}
