import { ApiRequestCommand } from '../../output/api-request-command.js';

export default class NoteOrderbooks extends ApiRequestCommand {
  public static override summary = 'List instruments that have notes';

  public async run(): Promise<void> {
    const { flags } = await this.parse(NoteOrderbooks);
    await this.request(flags, (client) => client.collections.noteOrderbooks(), true);
  }
}
