import { Flags } from '@oclif/core';

import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class Article extends ApiRequestCommand {
  public static override summary = 'Read a news article';
  public static override flags = {
    ...ApiRequestCommand.flags,
    url: Flags.string({ required: true, description: 'Article URL or path from the news feed' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Article);
    await this.request(flags, (client) => client.news.article(flags.url));
  }
}
