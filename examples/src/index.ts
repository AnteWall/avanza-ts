import { AvanzaClient } from "avanza-ts";
import { toString } from "qrcode";
import fetch from "node-fetch";
import { writeFileSync } from "fs";
import { InstrumentType } from "../../dist/client/types";

const client = new AvanzaClient({
  fetch,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("Signin with BankID");

  const res = await client.authenticateWithBankID(
    "19900101-1000",
    async (qrCode) => {
      console.log("Scan this QR code with your BankID app", qrCode);
      console.log(
        await toString(qrCode, { type: "terminal", scale: 0.4, width: 100 })
      );
    }
  );

  const positions = await client.market.getInstrument(
    InstrumentType.STOCK,
    "3323"
  );

  const jsonString = JSON.stringify(positions);
  writeFileSync("./instrument.json", jsonString);
}

main()
  .then(() => {
    console.log("Done with program");
  })
  .catch((err) => {
    try {
      const e = JSON.parse(err.message);
      console.error(e);
    } catch (e) {
      console.error(err);
    }
  });
