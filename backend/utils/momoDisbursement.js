import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { getDisbursementToken } from "./momoAuth.js";

export async function sendPayout({ amount, sellerPhone, externalId }) {
  try {
    const token = await getDisbursementToken();
    const referenceId = uuidv4();
    const { MOMO_DISBURSEMENT_PRIMARY_KEY } = process.env;

    const payload = {
      amount: amount.toString(),
      currency: "EUR", // Sandbox only
      externalId,
      payee: {
        partyIdType: "MSISDN",
        partyId: sellerPhone,
      },
      payerMessage: "Xoo Store Payout",
      payeeNote: "Thanks for selling with Xoo Store",
    };

    await axios.post(
      "https://sandbox.momodeveloper.mtn.com/disbursement/v1_0/transfer",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": MOMO_DISBURSEMENT_PRIMARY_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Payout initiated:", referenceId);
    return referenceId;
  } catch (err) {
    console.error("❌ Failed to send payout:", err.response?.data || err.message);
    throw err;
  }
}

//Check payout status
export async function getPayoutStatus(referenceId) {
  try {
    const token = await getDisbursementToken();
    const { MOMO_DISBURSEMENT_PRIMARY_KEY } = process.env;

    const { data } = await axios.get(
      `https://sandbox.momodeveloper.mtn.com/disbursement/v1_0/transfer/${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": MOMO_DISBURSEMENT_PRIMARY_KEY,
        },
      }
    );

    console.log("💬 Payout Status:", data);
    return data;
  } catch (err) {
    console.error("❌ Failed to get payout status:", err.response?.data || err.message);
    throw err;
  }
}
