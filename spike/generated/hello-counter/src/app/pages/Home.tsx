import { Counter } from "@/app/components/Counter";

export function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Counter App</h1>
        <Counter />
      </div>
    </div>
  );
}