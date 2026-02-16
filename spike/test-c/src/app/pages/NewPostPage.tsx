import { CreatePostForm } from "@/app/components/CreatePostForm";

export function NewPostPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <a href="/" className="text-blue-600 hover:text-blue-800 underline text-sm mb-6 inline-block">
        &larr; Back to Blog
      </a>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">New Post</h1>
      <CreatePostForm />
    </div>
  );
}
