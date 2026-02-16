import { env } from "cloudflare:workers";
import { Navigation } from "@/app/components/Navigation";

interface Post {
  id: string;
  title: string;
  body: string;
  published_at: string;
}

export async function PostPage({ params }: { params: { id: string } }) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM posts WHERE id = ?"
  ).bind(params.id).all();
  
  const post = results[0] as Post | undefined;
  
  if (!post) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Post Not Found
            </h1>
            <p className="text-gray-600">
              The post you're looking for doesn't exist.
            </p>
            <a 
              href="/" 
              className="inline-block mt-6 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to all posts
            </a>
          </div>
        </main>
      </div>
    );
  }

  const publishedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <article className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-8">
          <a 
            href="/" 
            className="inline-block text-blue-600 hover:text-blue-800 font-medium mb-6"
          >
            ← Back to all posts
          </a>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          
          <time className="text-gray-500 text-lg">
            {publishedDate}
          </time>
        </header>
        
        <div className="prose prose-lg max-w-none">
          {post.body.split('\n').map((paragraph, index) => (
            paragraph.trim() ? (
              <p key={index} className="mb-6 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ) : (
              <br key={index} />
            )
          ))}
        </div>
      </article>
    </div>
  );
}