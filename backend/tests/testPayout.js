import { sendPayout, getPayoutStatus } from "../utils/momoDisbursement.js";

async function test() {
  const ref = await sendPayout({
    amount: 50,
    sellerPhone: "96733123454", // Sandbox MSISDN
    externalId: "PAYOUT_002",
  });

  const status = await getPayoutStatus(ref);
  console.log(status);
}

test();
