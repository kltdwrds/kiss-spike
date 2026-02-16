"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);

  return (
    <div className="space-y-6">
      <div className="text-6xl font-bold text-blue-600">
        {count}
      </div>
      <div className="flex gap-4 justify-center">
        <button
          onClick={decrement}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Decrement
        </button>
        <button
          onClick={increment}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Increment
        </button>
      </div>
    </div>
  );
}