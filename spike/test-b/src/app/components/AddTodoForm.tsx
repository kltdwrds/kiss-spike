"use client";

import { addTodo } from "@/app/functions";

export function AddTodoForm() {
  return (
    <form action={addTodo} className="flex gap-2">
      <input
        type="text"
        name="title"
        placeholder="What needs to be done?"
        required
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add
      </button>
    </form>
  );
}
