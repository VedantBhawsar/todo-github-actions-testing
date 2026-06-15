"use client";

import { useState, FormEvent } from "react";
import type { CreateTodoDTO } from "@todo-app/types";

interface AddTodoFormProps {
  onAdd: (dto: CreateTodoDTO) => Promise<void>;
}

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setSubmitting(true);
    try {
      await onAdd({ title: trimmedTitle, description: description.trim() || undefined });
      setTitle("");
      setDescription("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
          data-testid="todo-title-input"
          disabled={submitting}
        />
      </div>
      <div>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
          data-testid="todo-description-input"
          disabled={submitting}
        />
      </div>
      <button
        type="submit"
        data-testid="add-todo-button"
        id="add-todo-button"
        disabled={submitting || !title.trim()}
        className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Adding...
          </span>
        ) : (
          "Add Todo"
        )}
      </button>
    </form>
  );
}
