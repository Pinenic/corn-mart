import AppError from '../utils/AppError.js';
import { getStoreAnalytics } from "../services/analytics.service.js";

export const getAnalytics = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { start_date, end_date } = req.body;
    if (!storeId || !start_date || !end_date) {
      throw new AppError('store id, start and end dates are required', 400, { code: 'MISSING_PARAMS' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new AppError('Invalid date format', 400, { code: 'INVALID_DATES' });

    const response = await getStoreAnalytics(storeId, start, end);

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};
