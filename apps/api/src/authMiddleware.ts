import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { findUserById } from "./authStore";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AuthRequest extends Request {
  user?: { id: number; email: string; name: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = findUserById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export { JWT_SECRET };
