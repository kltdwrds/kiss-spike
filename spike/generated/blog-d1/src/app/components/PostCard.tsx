interface Post {
  id: string;
  title: string;
  body: string;
  published_at: string;
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const publishedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const excerpt = post.body.length > 200 
    ? post.body.substring(0, 200) + '...' 
    : post.body;

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
      <header className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          <a 
            href={`/posts/${post.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {post.title}
          </a>
        </h2>
        
        <time className="text-gray-500">
          {publishedDate}
        </time>
      </header>
      
      <div className="mb-6">
        <p className="text-gray-700 leading-relaxed">
          {excerpt}
        </p>
      </div>
      
      <footer>
        <a 
          href={`/posts/${post.id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          Read more →
        </a>
      </footer>
    </article>
  );
}