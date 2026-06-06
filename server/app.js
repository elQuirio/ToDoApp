import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import helmet from 'helmet';

import { authLimiter, chatLimiter, generalLimiter } from './middleware/rateLimiters.js';
import { requireAuth } from './middleware/requireAuth.js';
import { authRoutes } from './routes/auth.js';
import { todosRoutes } from './routes/todos.js';
import { preferencesRoutes } from './routes/preferences.js';
import { chatRoutes } from './routes/chat.js';

const allowedOrigins = [ 'http://localhost:5173', 'https://todo-manager-beige.vercel.app' ]

export const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api', generalLimiter);
app.use('/api/chat', chatLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);

app.use('/api/todos', requireAuth);
app.use('/api/preferences', requireAuth);
app.use('/api/chat', requireAuth);



app.use('/api/auth', authRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/chat', chatRoutes);
