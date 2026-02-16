import { env } from "cloudflare:workers";
import { Navigation } from "@/app/components/Navigation";
import { CreatePostForm } from "@/app/components/CreatePostForm";

interface Post {
  id: string;
  title: string;
  body: string;
  published_at: string;
}

export async function AdminPage() {
  const { results } = await env.DB.prepare(
    "SELECT * FROM posts ORDER BY published_at DESC"
  ).all();
  
  const posts = results as Post[];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Create and manage your blog posts
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Create New Post
            </h2>
            <CreatePostForm />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Recent Posts ({posts.length})
            </h2>
            
            {posts.length === 0 ? (
              <p className="text-gray-500">No posts yet.</p>
            ) : (
              <div className="space-y-4">
                {posts.slice(0, 10).map((post) => {
                  const publishedDate = new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  
                  return (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        <a 
                          href={`/posts/${post.id}`}
                          className="hover:text-blue-600"
                        >
                          {post.title}
                        </a>
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {post.body.substring(0, 120)}{post.body.length > 120 ? '...' : ''}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {publishedDate}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}