export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  userId: number;
}

export interface CreateTodoDTO {
  title: string;
  description?: string;
}

export interface UpdateTodoDTO {
  completed: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  passwordHash?: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
}
