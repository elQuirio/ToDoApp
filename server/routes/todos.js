import { Router } from 'express';

import { getNewPosition, sortTodos, manualResortTodos, writeGetSortedTodos, getTodosByUserId, markAllTodosStatusByUserId, clearTodos } from '../db.js';
import { createTodoSchema, updateTodoSchema, resortSchema, reorderSchema, markAllParamsSchema, clearTodosQuerySchema } from '../schemas/todos.js';
import { validate } from '../middleware/validate.js';


export const todosRoutes = Router();

// GET
todosRoutes.get("/", (req, res) => {
  const userId = req.user.userId;
  const userTodos = getTodosByUserId(userId);
  return res.status(200).send({data: userTodos});
});

// PATCH
todosRoutes.patch("/resort", validate(resortSchema), (req, res) => {
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
todosRoutes.patch("/reorder", validate(reorderSchema), (req, res) => {
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
todosRoutes.patch("/mark-all/:status", validate(markAllParamsSchema, 'params'), (req, res) => {
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
todosRoutes.post("/", validate(createTodoSchema), (req, res) => {
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
todosRoutes.delete("/", validate(clearTodosQuerySchema, 'query'), (req, res) => {
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
todosRoutes.patch("/:id", validate(updateTodoSchema), (req, res) => {
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
