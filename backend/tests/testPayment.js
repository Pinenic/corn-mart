import { getPaymentStatus, requestToPay } from "../utils/momoCollections.js";

const testPayment = async () => {
  try {
    const ref = await requestToPay({
      amount: "10",
      phone: "46733123454", // use MoMo sandbox number
      externalId: "ORDER_001",
      payerMessage: "Xoo Store purchase",
      payeeNote: "Thank you for shopping with Xoo Store",
    });

    console.log("Transaction Reference:", ref);
    const status = await getPaymentStatus(ref);
    console.log("✅ Status retrieved: ",status)
  } catch (error) {
    console.error(error);
  }
};

testPayment();
