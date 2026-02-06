import AppError from '../utils/AppError.js';
import { createCheckout } from "../services/checkoutService.js";

export const momoCheckout = async (req, res, next) => {
  try {
    const { buyerId, items, payerNumber } = req.body; // items: [{ productId, storeId, quantity, price }]

    if (!buyerId || !items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('buyerId and items are required', 400, { code: 'INVALID_PAYLOAD' });
    }

    const response = await createCheckout(buyerId, items, payerNumber);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};
