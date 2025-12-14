import { getMomoToken, getDisbursementToken } from "../utils/momoAuth.js";

getMomoToken()
  .then((token) => {
    console.log("Your MoMo Token:", token);
  })
  .catch(console.error);

  getDisbursementToken()
  .then((token) => {
    console.log("Your MoMo disbursement Token:", token);
  })
  .catch(console.error);