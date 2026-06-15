import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { getAllTodos, createTodo, updateTodo, deleteTodo } from "./store";
import { createUser, validateUser } from "./authStore";
import { authMiddleware, JWT_SECRET, AuthRequest } from "./authMiddleware";
import type { CreateTodoDTO, UpdateTodoDTO, CreateUserDTO } from "@todo-app/types";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

app.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const dto = req.body as CreateUserDTO;
    if (!dto.email || !dto.password || !dto.name) {
      res.status(400).json({ error: "Email, password, and name are required" });
      return;
    }
    if (dto.password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }
    const user = await createUser(dto);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ user, token });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    res.status(400).json({ error: message });
  }
});

app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const user = await validateUser(email, password);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ user, token });
});

app.get("/todos", authMiddleware, (req: AuthRequest, res: Response) => {
  res.json(getAllTodos(req.user!.id));
});

app.post("/todos", authMiddleware, (req: AuthRequest, res: Response) => {
  const dto = req.body as CreateTodoDTO;
  if (!dto.title || typeof dto.title !== "string" || dto.title.trim() === "") {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  const todo = createTodo(req.user!.id, { title: dto.title.trim(), description: dto.description });
  res.status(201).json(todo);
});

app.patch("/todos/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const dto = req.body as UpdateTodoDTO;
  if (typeof dto.completed !== "boolean") {
    res.status(400).json({ error: "Completed must be a boolean" });
    return;
  }
  const todo = updateTodo(id, dto);
  if (!todo) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }
  res.json(todo);
});

app.delete("/todos/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const deleted = deleteTodo(id);
  if (!deleted) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }
  res.status(204).send();
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

export { app };
