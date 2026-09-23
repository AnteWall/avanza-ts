import { ApiRequestCommand } from '../../output/api-request-command.js';
import { listedProductFlags, listedProductOptions } from '../../output/listed-product-flags.js';

export default class Derivatives extends ApiRequestCommand {
  public static override summary = 'List futures, forwards, and options for an underlying';
  public static override description =
    'Defaults to OMX Stockholm 30 and the nearest expiries. The only supported sort field is strikePrice.';
  public static override flags = { ...ApiRequestCommand.flags, ...listedProductFlags };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Derivatives);
    const options = listedProductOptions(flags);
    await this.request(flags, (client) => client.instruments.screenDerivatives(options));
  }
}
