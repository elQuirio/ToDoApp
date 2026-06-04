import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15*60*1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {message: 'Too many auth attempts, please try again later'},
});