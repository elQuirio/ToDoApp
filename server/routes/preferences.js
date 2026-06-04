import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { patchPreferencesByUserId, sortTodos, getPreferencesByUserID } from '../db.js';
import { updatePreferencesSchema } from '../schemas/preferences.js';

export const preferencesRoutes = Router();

preferencesRoutes.patch('/', validate(updatePreferencesSchema), (req, res) => {
  const userId = req.user.userId;
  try {
    const preferences = patchPreferencesByUserId(userId, req.body);
    const todos = sortTodos(preferences.sortDirection, preferences.sortBy, userId);
    return res.json({data: {preferences: preferences, todos: todos}});
  } catch(err) {
    return res.status(500).json({message: "Error saving preferences"});
  }
});

preferencesRoutes.get('/', (req, res) => {
  const userId = req.user.userId;
  try {
    const preferences = getPreferencesByUserID(userId);
    return res.json({data: preferences});
  } catch (err) {
    return res.status(500).json({message: 'Error fetching preferences'});
  }
});
