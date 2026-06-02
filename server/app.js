import express from 'express';
import cors from 'cors';
import bcrypt from "bcrypt";
import crypto from 'crypto';
import cookieParser from "cookie-parser";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { clearTodos, getNewPosition, sortTodos, getPreferencesByUserID, patchPreferencesByUserId, manualResortTodos, getUserByEmail, registerNewUser, getUserByUserId, writeGetSortedTodos, getTodosByUserId, markAllTodosStatusByUserId, getMessagesByUserId, appendQuestionAnswer } from './db.js';
import { generateChatReply } from './services/chatService.js';
import { signToken, verifyToken } from './utils/auth.js';
import { validate } from './middleware/validate.js';
import { registerSchema, loginSchema } from './schemas/auth.js';
import { createTodoSchema, updateTodoSchema, resortSchema, reorderSchema, markAllParamsSchema, clearTodosQuerySchema } from './schemas/todos.js';

const allowedOrigins = [ 'http://localhost:5173', 'https://todo-manager-beige.vercel.app' ]
const isProd = process.env.NODE_ENV === 'production';
const sameSite = isProd ? 'none' : 'Lax';

export const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


/////////////////////////////////////// MIDDLEWARE ////////////////////////////////////////

function requireAuth(req, res, next) {
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

app.use('/api/todos', requireAuth);
app.use('/api/preferences', requireAuth);
app.use('/api/chat', requireAuth);

const authLimiter = rateLimit({
  windowMs: 15*60*1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {message: 'Too many auth attempts, please try again later'},
});
app.use('/api/auth', authLimiter);


///////////////////////////////////////// LOGIN / REGISTRATION ///////////////////////////////////////////

app.post('/api/auth/register', validate(registerSchema), async (req, res) => {
  const {email, password} = req.body;

  try {

    const userExists = getUserByEmail(email);
    if (userExists) {
      return res.status(409).json({data: {isLogged:false}, message: "Email already registered!"});
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    const savedUser = registerNewUser({email, password: hashedPwd, userId: userId});

    if (savedUser) {
      
      const jwtToken = signToken(savedUser.userId);
      return res.status(201).json({data: {isLogged: true, token: jwtToken, email: savedUser.email, userId: savedUser.userId }});

    } else {
      return res.status(500).json({data: {isLogged:false}, message: "Internal error saving user!"});
    }
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({data: {isLogged:false}, message: "Internal error saving user!"});
  }
});


app.post('/api/auth/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = getUserByEmail(email);

    if (!existingUser) {
      return res.status(401).json({data:{isLogged: false}, message: "User or password is wrong"});
    }

    if (existingUser && await bcrypt.compare(password, existingUser.password)) {
      const jwtToken = signToken(existingUser.userId);
      return res.status(200).json({data: {isLogged: true, token: jwtToken, userId: existingUser.userId, email: email}});
    } else {
      return res.status(401).json({data:{isLogged: false}, message: "User or password is wrong"});
    }
  } catch(err) {
    console.log(err);
    return res.status(500).json({data:{isLogged:false}, message: "Internal server error!"});
  }
});


app.get('/api/auth/checkAuth', (req, res) => {
  const authHeader = (req.headers.authorization);
  let userId;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(200).json({data: {isLogged: false}, message: "Invalid or missing token!"});
  }

  const token = (authHeader).split(' ')[1];

  try {
    const payload = verifyToken(token);
    userId = payload.userId;
  }
  catch (err) {
    return res.status(200).json({data: {isLogged: false}, message: "Invalid or missing token!"});
  }

  const userData = getUserByUserId(userId);

  if(!userData) {
    return res.status(200).json({data: { isLogged: false}, message: "User not found!"});
  }

  return res.status(200).json({data: {isLogged: true, userId: userData.userId, email: userData.email}});
});


app.post('/api/auth/logout', (req,res) => {
  return res.status(200).json({data:{isLogged:false}, message: 'User logged out'});
});


///////////////////////////////////////// TODOS ///////////////////////////////////////////

// GET
app.get("/api/todos", (req, res) => {
  const userId = req.user.userId;
  const userTodos = getTodosByUserId(userId);
  return res.status(200).send({data: userTodos});
});

// PATCH
app.patch("/api/todos/resort", validate(resortSchema), (req, res) => {
  const sortDirection = req.body.sortDirection;
  const sortBy = req.body.sortBy;
  const userId = req.user.userId;

  try {
    const todos = sortTodos(sortDirection, sortBy, userId);
    return res.status(200).send({data: todos});

  } catch (err) {
      console.log(err);
      return res.status(500).json({message: err ?? "Error sorting todos"});
    }
});

// PATCH
app.patch("/api/todos/reorder", validate(reorderSchema), (req, res) => {
  const userId = req.user.userId;
  const { fromId, toId } = req.body;

  try{
    const sortedTodos = manualResortTodos(fromId, toId, userId);
    return res.status(200).json({data: sortedTodos});
  } catch (err) {
    return res.status(500).json({message: "Error reordering todos"});
  }
});


//PATCH
app.patch("/api/todos/mark-all/:status", validate(markAllParamsSchema), (req, res) => {
  const { status } = req.params;
  const userId = req.user.userId;

  try {
    const updatedTodos = markAllTodosStatusByUserId(userId, status);
    return res.status(200).json({data: updatedTodos});

  } catch (err) {
    console.log(err);
    return res.status(500).json({message: "Error saving todo"});
  }
});


// POST
app.post("/api/todos", validate(createTodoSchema), (req, res) => {
  const userId = req.user.userId;
  const todo = { userId, ...req.body};
  todo.position = getNewPosition(userId);
  try {
    const todos = writeGetSortedTodos(todo, userId);
    return res.status(201).json({data: todos});
  } catch (err) {
    console.log(err);
    return res.status(500).json({message: "Error saving todo"});
  }
});


// DELETE
app.delete("/api/todos", validate(clearTodosQuerySchema), (req, res) => {
  const userId = req.user.userId;
  const { status } = req.query;

  try {
    const todos = clearTodos(userId, status);
    return res.status(200).json({data: todos});
  } catch (err) {
    console.log(err);
    return res.status(500).json({message: "Error clearing todos"});
  }
});

// PATCH
app.patch("/api/todos/:id", validate(updateTodoSchema), (req, res) => {
  const userId = req.user.userId;
  const todoId = req.params.id;
  const todo = {userId, ...req.body, id: todoId};

  try {
    const todos = writeGetSortedTodos(todo, userId);
    return res.status(200).json({data: todos});
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({message: "Error saving todo"});
  }
});


///////////////////////////////////////// PREFERENCES ///////////////////////////////////////////

app.patch('/api/preferences', (req, res) => {
  const userId = req.user.userId;
  try {
    const preferences = patchPreferencesByUserId(userId, req.body);
    const todos = sortTodos(preferences.sortDirection, preferences.sortBy, userId);
    return res.json({data: {preferences: preferences, todos: todos}});
  } catch(err) {
    return res.status(500).json({message: "Error saving preferences"});
  }
});

app.get('/api/preferences', (req, res) => {
  const userId = req.user.userId;
  try {
    const preferences = getPreferencesByUserID(userId);
    return res.json({data: preferences});
  } catch (err) {
    return res.status(500).json({message: 'Error fetching preferences'});
  }
});


///////////////////////////////////////// MESSAGES ///////////////////////////////////////////

app.get('/api/chat/messages', (req, res) => {
  const userId = req.user.userId;
  try {
    const messages = getMessagesByUserId(userId);
    return res.status(200).json({data: messages});
  } catch (err) {
    return res.status(500).json({message: 'Error fetching messages'});
  }
});

app.post('/api/chat/messages', async (req, res) => {
  const userId = req.user.userId;
  const messagePayload = req.body.message;
  try {
    if (!messagePayload) {
      return res.status(400).json({ message:'Message payload is required'});
    }
    const { conversationId, userText } = messagePayload;
    if (typeof userText !== 'string' || !userText.trim() || !conversationId) {
      return res.status(400).json({message: 'Incomplete request'});
    }

    const messageExchange = await generateChatReply(userId, conversationId, userText);

    return res.status(201).json({message: 'Message created successfully', data: {messages: messageExchange}});

  } catch(err) {
    console.log(err);
    return res.status(500).json({message: 'Error generating response'});
  }
});

