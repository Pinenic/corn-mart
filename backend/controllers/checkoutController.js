import { createCheckout } from "../services/checkoutService.js";

export const momoCheckout = async (req, res) => {
  try {
    const { buyerId, items, payerNumber } = req.body; // items: [{ productId, storeId, quantity, price }]
    const response = await createCheckout(buyerId, items, payerNumber);
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
};
