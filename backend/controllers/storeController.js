import {
  getAllStores,
  getStore,
  createNewStore,
  updateExistingStore,
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
      ? res.status(201).json({store: store, message: "The new store has been created successfully"})
      : res
          .json({ message: "A store already exists for this user" });
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
