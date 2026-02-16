"use client";

import { createPost } from "@/app/functions";

export function CreatePostForm() {
  return (
    <form action={createPost} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Post title"
        />
      </div>
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write your post..."
        />
      </div>
      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Publish
      </button>
    </form>
  );
}
