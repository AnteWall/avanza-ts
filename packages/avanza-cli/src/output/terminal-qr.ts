import QRCode from 'qrcode';

export class TerminalQr {
  #lines = 0;

  public clear(): void {
    if (this.#lines === 0) return;
    process.stdout.write(`\u001B[${this.#lines}A\u001B[0J`);
    this.#lines = 0;
  }

  public async render(payload: string): Promise<void> {
    const qr = await QRCode.toString(payload, { margin: 1, small: true, type: 'terminal' });
    const frame = `Scan the QR code with BankID:\n\n${qr}${qr.endsWith('\n') ? '' : '\n'}`;

    this.clear();
    process.stdout.write(frame);
    this.#lines = frame.split('\n').length - 1;
  }
}
