"use client";

import { createPost } from "@/app/functions";
import { useState } from "react";

export function CreatePostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    
    try {
      await createPost(formData);
      // Reset form
      event.currentTarget.reset();
      // Refresh the page to show the new post
      window.location.reload();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label 
          htmlFor="title" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Post Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          placeholder="Enter a compelling title..."
        />
      </div>
      
      <div>
        <label 
          htmlFor="body" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Post Content
        </label>
        <textarea
          id="body"
          name="body"
          required
          disabled={isSubmitting}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          placeholder="Write your post content here..."
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
      >
        {isSubmitting ? 'Creating Post...' : 'Create Post'}
      </button>
    </form>
  );
}