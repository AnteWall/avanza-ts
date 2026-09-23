import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Feed extends ApiRequestCommand {
  public static override summary = 'List news for held and watched instruments';
  public static override flags = {
    ...ApiRequestCommand.flags,
    limit: Flags.integer({ default: 10, min: 1, description: 'Number of articles' }),
    'max-days': Flags.integer({ default: 30, min: 1, description: 'Maximum article age in days' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Feed);
    await this.request(
      flags,
      (client) => client.news.feed({ count: flags.limit, maxDays: flags['max-days'] }),
      true,
    );
  }
}
