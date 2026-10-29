import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class InterestRates extends ApiRequestCommand {
  public static override summary = "Read Avanza's published interest rates";
  public static override flags = { ...ApiRequestCommand.flags };

  public async run(): Promise<void> {
    const { flags } = await this.parse(InterestRates);
    await this.request(flags, (client) => client.savings.interestRates());
  }
}
