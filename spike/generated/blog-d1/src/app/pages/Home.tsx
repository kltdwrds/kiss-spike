import { env } from "cloudflare:workers";
import { Navigation } from "@/app/components/Navigation";
import { PostCard } from "@/app/components/PostCard";

interface Post {
  id: string;
  title: string;
  body: string;
  published_at: string;
}

export async function Home() {
  const { results } = await env.DB.prepare(
    "SELECT * FROM posts ORDER BY published_at DESC"
  ).all();
  
  const posts = results as Post[];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            My Blog
          </h1>
          <p className="text-xl text-gray-600">
            Thoughts, stories and ideas
          </p>
        </div>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}