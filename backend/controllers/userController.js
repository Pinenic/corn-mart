import AppError from '../utils/AppError.js';
import { getAllUsers, getUser } from '../services/userService.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await getUser(id);
    if (!user) throw new AppError('User not found', 404, { code: 'USER_NOT_FOUND' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};
