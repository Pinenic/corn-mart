import { getPaymentStatus } from "../utils/momoCollections.js";

const referenceId = "0cd0493e-db2b-4358-8f83-19f76761a983"; // replace with your previous UUID

getPaymentStatus(referenceId)
  .then((data) => {
    console.log("✅ Status retrieved:", data);
  })
  .catch(console.error);
