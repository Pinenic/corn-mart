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

export const getStores = async (req, res) => {
  try {
    const stores = await getAllStores();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStoreById = async (req, res) => {
  try {
    const store = await getStore(req.params.id);
    if (!store)
      return res
        .status(404)
        .json({ error: "Store not found", id: req.params.id });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createStore = async (req, res) => {
  try {
    const files = {
      logo: req.files.logo?.[0],
      banner: req.files.banner?.[0],
    };
    const store = await createNewStore(req.body, files);
    store != null
      ? res
          .status(201)
          .json({
            store: store,
            message: "The new store has been created successfully",
          })
      : res.json({ message: "A store already exists for this user" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStore = async (req, res) => {
  try {
    const files = {
      logo: req.files.logo?.[0],
      banner: req.files.banner?.[0],
    };
    const store = await updateExistingStore(req.params.id, req.body, files);
    if (!store)
      return res
        .status(404)
        .json({ error: "Store not found", id: req.params.id });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 *  STORE FOLLOW SYSTEM
 */

export const follow = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { userId } = req.query;
    const response = await followStore(userId, storeId);
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const unfollow = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { userId } = req.query;
    const response = await unfollowStore(userId, storeId);
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const checkUserFollow = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { userId } = req.query;
    const response = await checkIfUserFollows(userId, storeId);
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getFollowersCount = async (req, res) => {
  try {
    const { storeId } = req.params;
    const response = await getFollowerCount(storeId);
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Create store location
 */
export const createStoreLocation = async (req, res) => {
  try {
    const { storeId } = req.params;
    const response = await createLocation(storeId, req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.log(error);
  }
};

/**
 * Get store location
 */
export const getStoreLocation = async (req, res) => {
  try {
    const { storeId } = req.params;
    const response = await getLocation(storeId);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.log(error);
  }
};

/**
 * Update store location
 */
export const updateStoreLocation = async (req, res) => {
  try {
    const { storeId } = req.params;
    const response = await updateLocation(storeId, req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.log(error);
  }
};

/**
 * Delete store location
 */
export const deleteStoreLocation = async (req, res) => {
  try {
    const { storeId } = req.params;
    const response = await deleteLocation(storeId);
    response ? res.status(204).send(): res.status(500);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.log(error);
  }
};
