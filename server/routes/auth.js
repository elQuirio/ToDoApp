import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { getUserByEmail, registerNewUser, getUserByUserId } from '../db.js';
import { signToken, verifyToken } from '../utils/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';

export const authRoutes = Router();

authRoutes.post('/register', validate(registerSchema), async (req, res) => {
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


authRoutes.post('/login', validate(loginSchema), async (req, res) => {
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


authRoutes.get('/checkAuth', (req, res) => {
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


authRoutes.post('/logout', (req,res) => {
  return res.status(200).json({data:{isLogged:false}, message: 'User logged out'});
});

