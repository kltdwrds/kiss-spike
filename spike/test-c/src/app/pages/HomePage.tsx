import { env } from "cloudflare:workers";

export async function HomePage() {
  const { results } = await env.DB.prepare(
    "SELECT id, title, created_at FROM posts ORDER BY created_at DESC"
  ).all();

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
        <a
          href="/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Post
        </a>
      </div>
      {results.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No posts yet. Write your first one!</p>
      ) : (
        <div className="space-y-4">
          {results.map((post: any) => (
            <a
              key={post.id}
              href={`/posts/${post.id}`}
              className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{post.title}</h2>
              <p className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
