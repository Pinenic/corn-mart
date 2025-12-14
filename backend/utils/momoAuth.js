// momoAuth.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const MOMO_BASE_URL = "https://sandbox.momodeveloper.mtn.com/collection/token/";

export async function getMomoToken() {
  try {
    const { MOMO_COLLECTION_USER_ID, MOMO_COLLECTION_API_KEY, MOMO_COLLECTION_SUBSCRIPTION_KEY } = process.env;

    // Base64 encode API user ID + key
    const credentials = Buffer.from(`${MOMO_COLLECTION_USER_ID}:${MOMO_COLLECTION_API_KEY}`).toString("base64");

    // Make request
    const response = await axios.post(
      MOMO_BASE_URL,
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Ocp-Apim-Subscription-Key": MOMO_COLLECTION_SUBSCRIPTION_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ MoMo Access Token Generated Successfully");
    console.log(response.data);

    return response.data.access_token;
  } catch (err) {
    console.error("❌ Failed to generate MoMo token:", err.response?.data || err.message);
    throw err;
  }
}

//disbursement token

export async function getDisbursementToken() {
  const {
    MOMO_DISBURSEMENT_PRIMARY_KEY,
    MOMO_DISBURSEMENT_API_USER_ID,
    MOMO_DISBURSEMENT_API_KEY,
  } = process.env;

  const auth = Buffer.from(`${MOMO_DISBURSEMENT_API_USER_ID}:${MOMO_DISBURSEMENT_API_KEY}`).toString("base64");

  try {
    const { data } = await axios.post(
      "https://sandbox.momodeveloper.mtn.com/disbursement/token/",
      {},
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Ocp-Apim-Subscription-Key": MOMO_DISBURSEMENT_PRIMARY_KEY,
        },
      }
    );

    return data.access_token;
  } catch (err) {
    console.error("❌ Failed to fetch disbursement token:", err.response?.data || err.message);
    throw err;
  }
}
