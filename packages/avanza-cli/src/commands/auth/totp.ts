import { cancel, isCancel, password, text } from '@clack/prompts';
import { Command } from '@oclif/core';
import { AvanzaClient } from 'avanza-ts';

import { saveSession } from '../../services/session/session-store.js';

export default class Totp extends Command {
  public static override summary = 'Sign in with username, password, and TOTP';

  public async run(): Promise<void> {
    await this.parse(Totp);

    const secret = environmentValue('AVANZA_TOTP_SECRET');
    const environmentCode = environmentValue('AVANZA_TOTP_CODE');
    if (secret !== undefined && environmentCode !== undefined) {
      this.error('Set only one of AVANZA_TOTP_SECRET and AVANZA_TOTP_CODE.');
    }

    const username =
      environmentValue('AVANZA_USERNAME') ?? (await this.promptText('Username', 'AVANZA_USERNAME'));
    const userPassword =
      environmentValue('AVANZA_PASSWORD') ??
      (await this.promptPassword('Password', 'AVANZA_PASSWORD'));
    const client = new AvanzaClient();
    const session =
      secret === undefined
        ? await client.auth.loginWithTotp({
            password: userPassword,
            totpCode: environmentCode ?? (await this.promptTotpCode()),
            username,
          })
        : await client.auth.loginWithTotp({
            password: userPassword,
            retryWithNextCode: true,
            totpSecret: secret,
            username,
          });

    await saveSession(session);
    this.log('Signed in with TOTP.');
  }

  private async promptPassword(message: string, variable: string): Promise<string> {
    this.ensureInteractive(variable);
    const value = await password({
      mask: '*',
      message,
      validate: required,
    });
    return this.unwrapPrompt(value);
  }

  private async promptText(message: string, variable: string): Promise<string> {
    this.ensureInteractive(variable);
    const value = await text({ message, validate: required });
    return this.unwrapPrompt(value);
  }

  private async promptTotpCode(): Promise<string> {
    this.ensureInteractive('AVANZA_TOTP_CODE');
    const value = await password({
      mask: '*',
      message: 'TOTP code',
      validate: (input) =>
        typeof input === 'string' && /^\d{6}$/.test(input)
          ? undefined
          : 'Enter exactly six digits.',
    });
    return this.unwrapPrompt(value);
  }

  private ensureInteractive(variable: string): void {
    if (process.stdin.isTTY !== true) {
      this.error(`Missing ${variable}; prompting requires an interactive terminal.`);
    }
  }

  private unwrapPrompt(value: string | symbol): string {
    if (isCancel(value) || typeof value !== 'string') {
      cancel('Authentication cancelled.');
      this.exit(130);
    }
    return value;
  }
}

function environmentValue(name: string): string | undefined {
  const value = process.env[name];
  return value === undefined || value.length === 0 ? undefined : value;
}

function required(value: string | undefined): string | undefined {
  return value === undefined || value.length === 0 ? 'Value is required.' : undefined;
}
