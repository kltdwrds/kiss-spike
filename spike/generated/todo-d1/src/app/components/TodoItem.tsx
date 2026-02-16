"use client";

import { toggleTodo, deleteTodo } from "@/app/functions";

interface Todo {
  id: string;
  title: string;
  completed: number;
  created_at: string;
}

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const isCompleted = todo.completed === 1;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${
      isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
    }`}>
      <form action={toggleTodo}>
        <input type="hidden" name="id" value={todo.id} />
        <input type="hidden" name="completed" value={isCompleted ? "false" : "true"} />
        <button
          type="submit"
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {isCompleted && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </form>

      <span className={`flex-1 ${
        isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
      }`}>
        {todo.title}
      </span>

      <form action={deleteTodo}>
        <input type="hidden" name="id" value={todo.id} />
        <button
          type="submit"
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete todo"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
    </div>
  );
}