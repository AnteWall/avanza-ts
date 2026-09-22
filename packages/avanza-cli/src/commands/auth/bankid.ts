import { setTimeout } from 'node:timers/promises';

import { Command } from '@oclif/core';
import { AvanzaClient, type BankIdAuthAttempt } from 'avanza-ts';

import { TerminalQr } from '../../output/terminal-qr.js';
import { saveSession } from '../../services/session/session-store.js';

export default class BankId extends Command {
  public static override summary = 'Sign in by scanning a rotating BankID QR code';

  public async run(): Promise<void> {
    await this.parse(BankId);
    if (process.stdin.isTTY !== true || process.stdout.isTTY !== true) {
      this.error('BankID authentication requires an interactive terminal.');
    }

    const controller = new AbortController();
    const renderer = new TerminalQr();
    const client = new AvanzaClient();
    const onInterrupt = () => controller.abort();
    let attempt: BankIdAuthAttempt | undefined;

    process.once('SIGINT', onInterrupt);
    try {
      attempt = await client.auth.startBankId({ signal: controller.signal });
      await renderer.render(attempt.challenge.qrPayload);

      // Each response determines the next rotating challenge; polling cannot overlap.
      /* oxlint-disable no-await-in-loop */
      while (true) {
        await setTimeout(attempt.challenge.refreshAfterMs, undefined, {
          signal: controller.signal,
        });
        const result = await attempt.poll();

        if (result.status === 'pending') {
          await renderer.render(result.challenge.qrPayload);
          continue;
        }

        if (result.status === 'complete') {
          await saveSession(result.session);
          this.log('Signed in with BankID.');
          return;
        }
        if (result.status === 'denied') {
          this.error('BankID authentication was denied.');
        }
        this.error('The BankID authentication attempt expired.');
      }
      /* oxlint-enable no-await-in-loop */
    } catch (error) {
      if (controller.signal.aborted) {
        this.error('BankID authentication cancelled.', { exit: 130 });
      }
      throw error;
    } finally {
      process.off('SIGINT', onInterrupt);
      renderer.clear();
      if (attempt !== undefined) {
        await attempt.cancel().catch(() => undefined);
      }
    }
  }
}
