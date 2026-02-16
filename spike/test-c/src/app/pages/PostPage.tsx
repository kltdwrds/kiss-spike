import { env } from "cloudflare:workers";

export async function PostPage({ params }: { params: { id: string } }) {
  const post = await env.DB.prepare(
    "SELECT * FROM posts WHERE id = ?"
  ).bind(params.id).first();

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <a href="/" className="text-blue-600 hover:text-blue-800 underline">
          &larr; Back to Blog
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <a href="/" className="text-blue-600 hover:text-blue-800 underline text-sm mb-6 inline-block">
        &larr; Back to Blog
      </a>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title as string}</h1>
      <p className="text-sm text-gray-500 mb-8">
        {new Date(post.created_at as string).toLocaleDateString()}
      </p>
      <div className="prose prose-gray">
        {(post.body as string).split("\n").map((paragraph, i) => (
          <p key={i} className="text-gray-700 mb-4">{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
