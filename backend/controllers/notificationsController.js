import {
  fetchBuyerNotifications,
  fetchSellerNotifications,
  markAllAsRead,
  markOneAsRead,
} from "../services/notificationService.js";

export const getAllBuyerNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await fetchBuyerNotifications(userId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllSellerNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await fetchSellerNotifications(userId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const readSingleNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await markOneAsRead(id);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const readAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await markAllAsRead(userId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};