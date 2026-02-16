"use client";

import { toggleTodo, deleteTodo } from "@/app/functions";

export function TodoItem({ todo }: { todo: any }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
      <form action={toggleTodo} className="flex items-center">
        <input type="hidden" name="id" value={todo.id} />
        <input type="hidden" name="completed" value={todo.completed} />
        <button
          type="submit"
          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            todo.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-400"
          }`}
        >
          {todo.completed ? "✓" : ""}
        </button>
      </form>
      <span className={`flex-1 ${todo.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
        {todo.title}
      </span>
      <form action={deleteTodo}>
        <input type="hidden" name="id" value={todo.id} />
        <button
          type="submit"
          className="text-red-400 hover:text-red-600 transition-colors"
        >
          ✕
        </button>
      </form>
    </div>
  );
}
