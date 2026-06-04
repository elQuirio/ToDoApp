import { Router } from "express";
import { validate } from '../middleware/validate.js';
import { getMessagesByUserId } from "../db.js";
import { generateChatReply } from '../services/chatService.js';
import { sendMessageSchema } from '../schemas/chat.js';

export const chatRoutes = Router();

chatRoutes.get('/messages', (req, res) => {
  const userId = req.user.userId;
  try {
    const messages = getMessagesByUserId(userId);
    return res.status(200).json({data: messages});
  } catch (err) {
    return res.status(500).json({message: 'Error fetching messages'});
  }
});

chatRoutes.post('/messages', validate(sendMessageSchema), async (req, res) => {
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

