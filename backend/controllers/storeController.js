import AppError from '../utils/AppError.js';
import {
  getAllStores,
  getStore,
  createNewStore,
  updateExistingStore,
  followStore,
  unfollowStore,
  checkIfUserFollows,
  getFollowerCount,
  createLocation,
  getLocation,
  updateLocation,
  deleteLocation,
} from "../services/storeService.js";

export const getStores = async (req, res, next) => {
  try {
    const stores = await getAllStores();
    res.json(stores);
  } catch (err) {
    next(err);
  }
};

export const getStoreById = async (req, res, next) => {
  try {
    const store = await getStore(req.params.id);
    if (!store) throw new AppError('Store not found', 404, { code: 'STORE_NOT_FOUND', id: req.params.id });
    res.json(store);
  } catch (err) {
    next(err);
  }
};

export const createStore = async (req, res, next) => {
  try {
    const files = {
      logo: req.files.logo?.[0],
      banner: req.files.banner?.[0],
    };
    const store = await createNewStore(req.body, files);
    if (!store) throw new AppError('A store already exists for this user', 409, { code: 'STORE_ALREADY_EXISTS' });
    res.status(201).json({ store: store, message: 'The new store has been created successfully' });
  } catch (err) {
    next(err);
  }
};

export const updateStore = async (req, res, next) => {
  try {
    const files = {
      logo: req.files.logo?.[0],
      banner: req.files.banner?.[0],
    };
    const store = await updateExistingStore(req.params.id, req.body, files);
    if (!store) throw new AppError('Store not found', 404, { code: 'STORE_NOT_FOUND', id: req.params.id });
    res.json(store);
  } catch (err) {
    next(err);
  }
};

/**
 *  STORE FOLLOW SYSTEM
 */

export const follow = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { userId } = req.query;
    if (!userId) throw new AppError('userId is required', 400, { code: 'INVALID_PAYLOAD' });
    const response = await followStore(userId, storeId);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const unfollow = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { userId } = req.query;
    if (!userId) throw new AppError('userId is required', 400, { code: 'INVALID_PAYLOAD' });
    const response = await unfollowStore(userId, storeId);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const checkUserFollow = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { userId } = req.query;
    if (!userId) throw new AppError('userId is required', 400, { code: 'INVALID_PAYLOAD' });
    const response = await checkIfUserFollows(userId, storeId);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getFollowersCount = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const response = await getFollowerCount(storeId);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Create store location
 */
export const createStoreLocation = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const response = await createLocation(storeId, req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get store location
 */
export const getStoreLocation = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const response = await getLocation(storeId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Update store location
 */
export const updateStoreLocation = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const response = await updateLocation(storeId, req.body);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete store location
 */
export const deleteStoreLocation = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const response = await deleteLocation(storeId);
    if (response) return res.status(204).send();
    throw new AppError('Problem deleting store location', 500, { code: 'DELETE_LOCATION_FAILED' });
  } catch (error) {
    next(error);
  }
};
