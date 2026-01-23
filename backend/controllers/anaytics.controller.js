import { getStoreAnalytics } from "../services/analytics.service.js";

export const getAnalytics = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { start_date, end_date } = req.body;
    if (!storeId || !start_date || !end_date) {
      return res
        .status(400)
        .json({ error: "store id, start and end dates are required" });
    }

    // Convert to date objects if needed
    const start = new Date(start_date);
    const end = new Date(end_date);

    const response = await getStoreAnalytics(storeId, start, end);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
