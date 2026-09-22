import { describe, expect, it, vi } from 'vitest';

const toString = vi.hoisted(() => vi.fn());
vi.mock('qrcode', () => ({ default: { toString } }));

import { TerminalQr } from './terminal-qr.js';

describe('TerminalQr', () => {
  it('replaces only its previous terminal block', async () => {
    toString.mockResolvedValue('QR\nLINE\n');
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const renderer = new TerminalQr();

    await renderer.render('first');
    await renderer.render('second');
    renderer.clear();
    renderer.clear();

    expect(toString).toHaveBeenNthCalledWith(1, 'first', {
      margin: 1,
      small: true,
      type: 'terminal',
    });
    expect(write.mock.calls).toEqual([
      ['Scan the QR code with BankID:\n\nQR\nLINE\n'],
      ['\u001B[4A\u001B[0J'],
      ['Scan the QR code with BankID:\n\nQR\nLINE\n'],
      ['\u001B[4A\u001B[0J'],
    ]);
  });
});
