import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { TodoItem } from "../src/components/TodoItem";

describe("TodoItem", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders title", () => {
    render(
      <TodoItem
        todo={{ id: 1, title: "Test Todo", completed: false, createdAt: new Date().toISOString() }}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByTestId("todo-title").textContent).toBe("Test Todo");
  });

  it("renders description when present", () => {
    render(
      <TodoItem
        todo={{
          id: 1,
          title: "Test Todo",
          description: "Some description",
          completed: false,
          createdAt: new Date().toISOString(),
        }}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByTestId("todo-description").textContent).toBe("Some description");
  });

  it("does not render description when absent", () => {
    render(
      <TodoItem
        todo={{ id: 1, title: "Test Todo", completed: false, createdAt: new Date().toISOString() }}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.queryByTestId("todo-description")).toBeNull();
  });

  it("calls onToggle with correct id and new completed value when complete button clicked", async () => {
    const onToggle = vi.fn();
    render(
      <TodoItem
        todo={{ id: 1, title: "Test Todo", completed: false, createdAt: new Date().toISOString() }}
        onToggle={onToggle}
        onDelete={vi.fn()}
      />
    );
    screen.getByTestId("toggle-todo-button").click();
    expect(onToggle).toHaveBeenCalledWith(1, true);
  });

  it("calls onDelete with correct id when delete button clicked", async () => {
    const onDelete = vi.fn();
    render(
      <TodoItem
        todo={{ id: 1, title: "Test Todo", completed: false, createdAt: new Date().toISOString() }}
        onToggle={vi.fn()}
        onDelete={onDelete}
      />
    );
    screen.getByTestId("delete-todo-button").click();
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it("applies strikethrough style when completed", () => {
    const { getByTestId } = render(
      <TodoItem
        todo={{ id: 1, title: "Test Todo", completed: true, createdAt: new Date().toISOString() }}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(getByTestId("todo-title").classList).toContain("line-through");
  });
});
