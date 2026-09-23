import { Flags } from '@oclif/core';
import type { AvanzaClient } from 'avanza-ts';

export const watchlistFlags = {
  'watchlist-id': Flags.string({ required: true, description: 'Watchlist ID' }),
  'orderbook-ids': Flags.string({
    description: 'Comma-separated orderbook IDs; defaults to the whole watchlist',
  }),
};

export async function watchlistOrderbookIds(
  client: AvanzaClient,
  flags: { 'watchlist-id': string; 'orderbook-ids': string | undefined },
): Promise<string[]> {
  if (flags['orderbook-ids'] !== undefined) return flags['orderbook-ids'].split(',');
  const watchlist = (await client.collections.watchlists()).find(
    (candidate) => candidate.watchListId === flags['watchlist-id'],
  );
  if (watchlist === undefined) throw new Error(`Watchlist ${flags['watchlist-id']} not found.`);
  return [...watchlist.orderbookIds];
}
