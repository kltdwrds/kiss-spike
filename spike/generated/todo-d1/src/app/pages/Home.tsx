import { env } from "cloudflare:workers";
import { AddTodoForm } from "@/app/components/AddTodoForm";
import { TodoList } from "@/app/components/TodoList";

export async function Home() {
  const { results } = await env.DB.prepare("SELECT * FROM todos ORDER BY created_at DESC").all();
  const todos = results as Array<{
    id: string;
    title: string;
    completed: number;
    created_at: string;
  }>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Todo App
      </h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <AddTodoForm />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Your Todos ({todos.length})
        </h2>
        <TodoList todos={todos} />
      </div>
    </div>
  );
}