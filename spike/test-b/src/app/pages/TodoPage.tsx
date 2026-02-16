import { env } from "cloudflare:workers";
import { AddTodoForm } from "@/app/components/AddTodoForm";
import { TodoItem } from "@/app/components/TodoItem";

export async function TodoPage() {
  const { results } = await env.DB.prepare(
    "SELECT * FROM todos ORDER BY created_at DESC"
  ).all();

  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Todo List</h1>
      <AddTodoForm />
      <div className="mt-6 space-y-2">
        {results.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No todos yet. Add one above!</p>
        ) : (
          results.map((todo: any) => (
            <TodoItem key={todo.id} todo={todo} />
          ))
        )}
      </div>
    </div>
  );
}
