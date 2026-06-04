import { verifyToken } from '../utils/auth.js';
import { getUserByUserId } from '../db.js';

export function requireAuth(req, res, next) {
  try {
    let userId;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({message: "User not authenticated!"});
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({message: "User not authenticated!"});
    }

    try {
      const payload = verifyToken(token);
      userId = payload.userId;

      if (!userId) {
        return res.status(401).json({message: "User not authenticated!"});
      }
    }

    catch (err) {
      return res.status(401).json({message: "User not authenticated!"});
    }

    const user = getUserByUserId(userId);

    if (!user) {
      return res.status(401).json({message: "User not authenticated!"});
    }

    req.user = user;
    req.token = token;
    next();

  } catch (e) {
    return res.status(500).json({message: "Error checking authentication!"});
  }
};