'use client';

import { useAuth } from '@/context/AuthContext';
import { useTodos } from '@/hooks/useTodos';
import { AddTodoForm, TodoList } from '@/components';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const { todos, loading, error, addTodo, toggleComplete, removeTodo } = useTodos();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Tod</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user.name}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          <AddTodoForm onAdd={addTodo} />
        </div>

        <div className="mt-6">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary-500 border-t-transparent"></div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          <TodoList todos={todos} onToggle={toggleComplete} onDelete={removeTodo} />
        </div>
      </div>
    </main>
  );
}
