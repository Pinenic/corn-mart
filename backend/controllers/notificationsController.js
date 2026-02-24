import AppError from '../utils/AppError.js';
import {
  fetchBuyerNotifications,
  fetchSellerNotifications,
  markAllAsRead,
  markAllAsViewed,
  markOneAsRead,
} from "../services/notificationService.js";

export const getAllBuyerNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new AppError('userId is required', 400, { code: 'MISSING_PARAMS' });
    const response = await fetchBuyerNotifications(userId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getAllSellerNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new AppError('userId is required', 400, { code: 'MISSING_PARAMS' });
    const response = await fetchSellerNotifications(userId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const readSingleNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await markOneAsRead(id);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const readAllNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new AppError('userId is required', 400, { code: 'MISSING_PARAMS' });
    const response = await markAllAsRead(userId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const viewAllNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new AppError('userId is required', 400, { code: 'MISSING_PARAMS' });
    const response = await markAllAsViewed(userId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};