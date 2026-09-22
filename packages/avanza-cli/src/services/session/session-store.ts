import { AsyncEntry, type EntryOptions } from '@napi-rs/keyring';
import type { AvanzaSession } from 'avanza-ts';

const SERVICE = 'avanza-cli';
const ACCOUNT = 'session';

export class InvalidStoredSessionError extends Error {
  public constructor(cause: unknown) {
    super('The session stored in the OS credential store is invalid.', { cause });
    this.name = 'InvalidStoredSessionError';
  }
}

export async function loadSession(): Promise<AvanzaSession | undefined> {
  const serialized = await entry().getPassword();
  if (serialized === undefined || serialized === null) return undefined;

  try {
    return parseSession(JSON.parse(serialized));
  } catch (error) {
    throw new InvalidStoredSessionError(error);
  }
}

export async function saveSession(session: AvanzaSession): Promise<void> {
  const serialized = JSON.stringify(session);
  parseSession(JSON.parse(serialized));
  await entry().setPassword(serialized);
}

export async function deleteSession(): Promise<boolean> {
  return entry().deletePassword();
}

function entry(): AsyncEntry {
  const options: EntryOptions | undefined =
    process.platform === 'linux' ? { linux: { store: 'secret-service' } } : undefined;
  return new AsyncEntry(SERVICE, ACCOUNT, options);
}

function parseSession(value: unknown): AvanzaSession {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError('Invalid session.');
  }

  const session = value as Record<string, unknown>;
  if (
    session.mode === 'totp' &&
    typeof session.authenticationSession === 'string' &&
    typeof session.securityToken === 'string'
  ) {
    return session as unknown as AvanzaSession;
  }
  if (session.mode === 'bankid' && Array.isArray(session.cookies)) {
    return session as unknown as AvanzaSession;
  }

  throw new TypeError('Invalid session.');
}
