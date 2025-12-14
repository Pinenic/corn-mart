// momoCollections.js
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { getMomoToken } from "./momoAuth.js";

dotenv.config();

const MOMO_COLLECTION_URL = "https://sandbox.momodeveloper.mtn.com/collection/v1_0";

export async function requestToPay({ amount, phone, externalId, payerMessage, payeeNote }) {
  try {
    const token = await getMomoToken();
    const referenceId = uuidv4(); // unique transaction ID

    const { MOMO_COLLECTION_SUBSCRIPTION_KEY } = process.env;

    const response = await axios.post(
      `${MOMO_COLLECTION_URL}/requesttopay`,
      {
        amount,
        currency: "EUR", // Zambian Kwacha
        externalId,
        payer: {
          partyIdType: "MSISDN",
          partyId: phone, // e.g. "260970000001"
        },
        payerMessage,
        payeeNote,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": MOMO_COLLECTION_SUBSCRIPTION_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Payment request created successfully");
    console.log("Reference ID:", referenceId);

    return {referenceId, response}; // use it to check payment status later
  } catch (err) {
    console.error("❌ Failed to create payment request:", err.response?.data || err.message);
    throw err;
  }
}

//Check payment status
export async function getPaymentStatus(referenceId) {
  try {
    const token = await getMomoToken();
    const { MOMO_COLLECTION_SUBSCRIPTION_KEY } = process.env;

    const response = await axios.get(
      `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": MOMO_COLLECTION_SUBSCRIPTION_KEY,
        },
      }
    );

    console.log("💬 Payment Status:", response.data);
    return response.data;
  } catch (err) {
    console.error("❌ Failed to fetch payment status:", err.response?.data || err.message);
    throw err;
  }
}

