"use client";

import type { Todo } from "@todo-app/types";
import { useState } from "react";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(todo.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <li
      data-testid="todo-item"
      className={`bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 animate-slide-up ${deleting ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(todo.id, !todo.completed)}
          data-testid="toggle-todo-button"
          aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
          className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            todo.completed
              ? 'bg-primary-500 border-primary-500'
              : 'border-slate-300 hover:border-primary-500'
          }`}
        >
          {todo.completed && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p
            data-testid="todo-title"
            className={`text-slate-900 font-medium ${todo.completed ? 'line-through text-slate-400' : ''}`}
          >
            {todo.title}
          </p>
          {todo.description && (
            <p
              data-testid="todo-description"
              className={`mt-1 text-sm text-slate-500 ${todo.completed ? 'line-through' : ''}`}
            >
              {todo.description}
            </p>
          )}
        </div>

        <button
          onClick={handleDelete}
          data-testid="delete-todo-button"
          aria-label="Delete todo"
          disabled={deleting}
          className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </li>
  );
}
