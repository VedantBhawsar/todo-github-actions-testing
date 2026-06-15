import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddTodoForm } from "../src/components/AddTodoForm";

describe("AddTodoForm", () => {
  beforeEach(() => {
    cleanup();
  });

  it("calls onAdd with correct values when form is submitted", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddTodoForm onAdd={onAdd} />);

    await userEvent.type(screen.getByTestId("todo-title-input"), "New Todo");
    await userEvent.type(screen.getByTestId("todo-description-input"), "Some description");
    await userEvent.click(screen.getByTestId("add-todo-button"));

    expect(onAdd).toHaveBeenCalledWith({
      title: "New Todo",
      description: "Some description",
    });
  });

  it("trims title before submission", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddTodoForm onAdd={onAdd} />);

    await userEvent.type(screen.getByTestId("todo-title-input"), "  New Todo  ");
    await userEvent.click(screen.getByTestId("add-todo-button"));

    expect(onAdd).toHaveBeenCalledWith({
      title: "New Todo",
      description: undefined,
    });
  });

  it("does not submit when title is empty", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddTodoForm onAdd={onAdd} />);

    await userEvent.type(screen.getByTestId("todo-title-input"), "   ");
    await userEvent.click(screen.getByTestId("add-todo-button"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not submit when title is only whitespace", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddTodoForm onAdd={onAdd} />);

    await userEvent.type(screen.getByTestId("todo-title-input"), "\t\n  ");
    await userEvent.click(screen.getByTestId("add-todo-button"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("clears form fields after successful submission", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddTodoForm onAdd={onAdd} />);

    await userEvent.type(screen.getByTestId("todo-title-input"), "New Todo");
    await userEvent.type(screen.getByTestId("todo-description-input"), "Description");
    await userEvent.click(screen.getByTestId("add-todo-button"));

    expect((screen.getByTestId("todo-title-input") as HTMLInputElement).value).toBe("");
    expect((screen.getByTestId("todo-description-input") as HTMLInputElement).value).toBe("");
  });

  it("disables button while submitting", async () => {
    const onAdd = vi.fn().mockImplementation(() => new Promise((r) => { }));
    render(<AddTodoForm onAdd={onAdd} />);

    await userEvent.type(screen.getByTestId("todo-title-input"), "New Todo");
    await userEvent.click(screen.getByTestId("add-todo-button"));

    expect((screen.getByTestId("add-todo-button") as HTMLButtonElement).disabled).toBe(true);
  });
});
