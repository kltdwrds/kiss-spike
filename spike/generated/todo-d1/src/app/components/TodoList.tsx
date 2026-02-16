import { TodoItem } from "@/app/components/TodoItem";

interface Todo {
  id: string;
  title: string;
  completed: number;
  created_at: string;
}

interface TodoListProps {
  todos: Todo[];
}

export function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No todos yet. Add one above!
      </div>
    );
  }

  const completedCount = todos.filter(todo => todo.completed === 1).length;
  const pendingCount = todos.length - completedCount;

  return (
    <div>
      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <span>{pendingCount} pending</span>
        <span>{completedCount} completed</span>
      </div>
      
      <div className="space-y-2">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
}