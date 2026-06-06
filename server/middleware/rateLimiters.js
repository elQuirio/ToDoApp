import rateLimit from 'express-rate-limit';

function createLimiter({ limit, message = 'Too many requests, please try again later', windowMinutes = 15 }) {
  return rateLimit({
    windowMs: windowMinutes*60*1000,
    limit: process.env.NODE_ENV === 'test' ? 1000 : limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {message: message},
  })
};


export const authLimiter = createLimiter({limit: 20, message: 'Too many auth attempts, retry later.'});

export const chatLimiter = createLimiter({limit: 30, message: 'You have reached your quota messages, try again later.'});

export const generalLimiter = createLimiter({limit: 300});