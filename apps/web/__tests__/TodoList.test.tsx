import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { TodoList } from "../src/components/TodoList";

describe("TodoList", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders multiple todos", () => {
    const todos = [
      { id: 1, title: "Todo 1", completed: false, createdAt: new Date().toISOString() },
      { id: 2, title: "Todo 2", completed: true, createdAt: new Date().toISOString() },
    ];
    render(<TodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByTestId("todo-list").children).toHaveLength(2);
  });

  it("renders empty state when list is empty", () => {
    render(<TodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByTestId("empty-state")).toBeTruthy();
    expect(screen.queryByTestId("todo-list")).toBeNull();
  });

  it("does not render empty state when todos exist", () => {
    const todos = [
      { id: 1, title: "Todo 1", completed: false, createdAt: new Date().toISOString() },
    ];
    render(<TodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByTestId("empty-state")).toBeNull();
  });
});
