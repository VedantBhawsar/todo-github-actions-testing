import type { User, CreateUserDTO } from "@todo-app/types";
import bcrypt from "bcryptjs";

let idCounter = 1;

export const users: User[] = [];

export function resetUsers(): void {
  users.length = 0;
  idCounter = 1;
}

export async function createUser(dto: CreateUserDTO): Promise<User> {
  const existing = users.find((u) => u.email === dto.email);
  if (existing) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);
  const user: User = {
    id: idCounter++,
    email: dto.email,
    name: dto.name,
    passwordHash: hashedPassword,
  };
  users.push(user);
  return { id: user.id, email: user.email, name: user.name };
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  const user = users.find((u) => u.email === email);
  if (!user || !user.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return { id: user.id, email: user.email, name: user.name };
}

export function findUserById(id: number): User | null {
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name };
}
