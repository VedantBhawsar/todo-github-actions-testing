import type { Todo, CreateTodoDTO, UpdateTodoDTO } from "@todo-app/types";

let idCounter = 1;

export const store: Todo[] = [];

export function resetStore(): void {
  store.length = 0;
  idCounter = 1;
}

export function getAllTodos(userId: number): Todo[] {
  return store.filter((t) => t.userId === userId);
}

export function createTodo(userId: number, dto: CreateTodoDTO): Todo {
  const todo: Todo = {
    id: idCounter++,
    title: dto.title,
    description: dto.description,
    completed: false,
    createdAt: new Date().toISOString(),
    userId,
  };
  store.push(todo);
  return todo;
}

export function updateTodo(id: number, dto: UpdateTodoDTO): Todo | null {
  const todo = store.find((t) => t.id === id);
  if (!todo) return null;
  todo.completed = dto.completed;
  return todo;
}

export function deleteTodo(id: number): boolean {
  const index = store.findIndex((t) => t.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}
