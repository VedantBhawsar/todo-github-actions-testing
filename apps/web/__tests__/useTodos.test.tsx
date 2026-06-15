import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { useTodos } from "../src/hooks/useTodos";

const API_URL = "http://localhost:3001";

function TestComponent() {
  const { todos, loading, error, addTodo, toggleComplete, removeTodo } = useTodos();
  return (
    <div>
      {loading && <p data-testid="loading">Loading...</p>}
      {error && <p data-testid="error">{error}</p>}
      <ul data-testid="todo-list">
        {todos.map((t) => (
          <li key={t.id} data-testid={`todo-${t.id}`}>
            {t.title} - {t.completed ? "done" : "pending"}
          </li>
        ))}
      </ul>
      <button onClick={() => addTodo({ title: "New todo" })} data-testid="add-btn">
        Add
      </button>
      <button
        onClick={() => toggleComplete(todos[0]?.id, !todos[0]?.completed)}
        data-testid="toggle-btn"
        disabled={todos.length === 0}
      >
        Toggle
      </button>
      <button onClick={() => removeTodo(todos[0]?.id)} data-testid="delete-btn" disabled={todos.length === 0}>
        Delete
      </button>
    </div>
  );
}

const server = setupServer();

describe("useTodos", () => {
  beforeEach(() => {
    server.listen();
    cleanup();
  });

  afterEach(() => {
    server.close();
    server.resetHandlers();
  });

  it("shows error state on fetch failure", async () => {
    server.use(
      http.get(`${API_URL}/todos`, () => HttpResponse.error())
    );
    render(<TestComponent />);
    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeTruthy();
    });
  });

  it("renders todos after successful fetch", async () => {
    server.use(
      http.get(`${API_URL}/todos`, () =>
        HttpResponse.json([
          { id: 1, title: "Test Todo", completed: false, createdAt: new Date().toISOString() },
        ])
      )
    );
    render(<TestComponent />);
    await waitFor(() => {
      expect(screen.getByTestId("todo-1")).toBeTruthy();
    });
  });
});
