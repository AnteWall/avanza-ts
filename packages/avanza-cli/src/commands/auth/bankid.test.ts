import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cancel: vi.fn(),
  clear: vi.fn(),
  poll: vi.fn(),
  render: vi.fn(),
  saveSession: vi.fn(),
  startBankId: vi.fn(),
}));

vi.mock('avanza-ts', () => ({
  AvanzaClient: class {
    public auth = { startBankId: mocks.startBankId };
  },
}));

vi.mock('../../output/terminal-qr.js', () => ({
  TerminalQr: class {
    public clear = mocks.clear;
    public render = mocks.render;
  },
}));

vi.mock('../../services/session/session-store.js', () => ({ saveSession: mocks.saveSession }));

import BankId from './bankid.js';

const packageRoot = resolve(import.meta.dirname, '../../..');
const session = { cookies: [{ key: 'session', value: 'credential' }], mode: 'bankid' as const };

describe('auth bankid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setTty(process.stdin, true);
    setTty(process.stdout, true);
    mocks.cancel.mockResolvedValue(undefined);
    mocks.render.mockResolvedValue(undefined);
    mocks.saveSession.mockResolvedValue(undefined);
    mocks.startBankId.mockResolvedValue({
      cancel: mocks.cancel,
      challenge: challenge('initial'),
      poll: mocks.poll,
    });
  });

  afterEach(() => {
    delete (process.stdin as unknown as { isTTY?: boolean }).isTTY;
    delete (process.stdout as unknown as { isTTY?: boolean }).isTTY;
  });

  it('renders rotating QR payloads and saves a completed session', async () => {
    mocks.poll
      .mockResolvedValueOnce({ challenge: challenge('rotated'), status: 'pending' })
      .mockResolvedValueOnce({ session, status: 'complete' });

    await BankId.run([], { root: packageRoot });

    expect(mocks.render.mock.calls).toEqual([['initial'], ['rotated']]);
    expect(mocks.saveSession).toHaveBeenCalledWith(session);
    expect(mocks.cancel).toHaveBeenCalledOnce();
  });

  it('cancels an unsuccessful attempt', async () => {
    mocks.poll.mockResolvedValue({ status: 'denied' });

    await expect(BankId.run([], { root: packageRoot })).rejects.toThrow(
      'BankID authentication was denied.',
    );
    expect(mocks.cancel).toHaveBeenCalledOnce();
    expect(mocks.saveSession).not.toHaveBeenCalled();
  });

  it('aborts and cancels on Ctrl+C', async () => {
    let signal: AbortSignal | undefined;
    mocks.startBankId.mockImplementation(async (options: { signal: AbortSignal }) => {
      signal = options.signal;
      return {
        cancel: mocks.cancel,
        challenge: challenge('initial'),
        poll: vi.fn(
          () =>
            new Promise((_, reject) => {
              options.signal.addEventListener('abort', () => reject(options.signal.reason), {
                once: true,
              });
            }),
        ),
      };
    });

    const running = BankId.run([], { root: packageRoot });
    await vi.waitFor(() => expect(mocks.render).toHaveBeenCalled());
    process.emit('SIGINT');

    await expect(running).rejects.toThrow('BankID authentication cancelled.');
    expect(signal?.aborted).toBe(true);
    expect(mocks.cancel).toHaveBeenCalledOnce();
  });

  it('requires a TTY', async () => {
    setTty(process.stdout, false);

    await expect(BankId.run([], { root: packageRoot })).rejects.toThrow(
      'requires an interactive terminal',
    );
    expect(mocks.startBankId).not.toHaveBeenCalled();
  });
});

function challenge(qrPayload: string) {
  return { autostartToken: 'token', autostartUrl: 'bankid:///', qrPayload, refreshAfterMs: 0 };
}

function setTty(stream: NodeJS.ReadStream | NodeJS.WriteStream, isTTY: boolean): void {
  Object.defineProperty(stream, 'isTTY', { configurable: true, value: isTTY });
}
