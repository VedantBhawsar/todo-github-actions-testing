import { useState, useEffect, useCallback } from "react";
import type { Todo, CreateTodoDTO, UpdateTodoDTO } from "@todo-app/types";
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "../api";

interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  addTodo: (dto: CreateTodoDTO) => Promise<void>;
  toggleComplete: (id: number, completed: boolean) => Promise<void>;
  removeTodo: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addTodo = useCallback(async (dto: CreateTodoDTO) => {
    const newTodo = await createTodo(dto);
    setTodos((prev) => [...prev, newTodo]);
  }, []);

  const toggleComplete = useCallback(async (id: number, completed: boolean) => {
    const updated = await updateTodo(id, { completed });
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? updated : t))
    );
  }, []);

  const removeTodo = useCallback(async (id: number) => {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { todos, loading, error, addTodo, toggleComplete, removeTodo, refetch };
}
