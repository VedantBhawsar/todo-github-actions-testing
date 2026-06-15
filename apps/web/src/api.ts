import type { Todo, CreateTodoDTO, UpdateTodoDTO } from "@todo-app/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  return res;
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetchWithAuth(`${API_URL}/todos`);
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}

export async function createTodo(dto: CreateTodoDTO): Promise<Todo> {
  const res = await fetchWithAuth(`${API_URL}/todos`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Failed to create todo");
  return res.json();
}

export async function updateTodo(id: number, dto: UpdateTodoDTO): Promise<Todo> {
  const res = await fetchWithAuth(`${API_URL}/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Failed to update todo");
  return res.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/todos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete todo");
}
