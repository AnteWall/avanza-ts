import { AvanzaClient } from "avanza-ts";
import { toString } from "qrcode";
import { readFileSync, writeFileSync } from "fs";
const client = new AvanzaClient();

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

  const response = await client.account.getAccountOverview(
    res.logins[0].accounts[0].accountName
  );

  console.log(response);

  const positions = await client.account.getPositions();

  const jsonString = JSON.stringify(positions);
  writeFileSync("./positions.json", jsonString);
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
