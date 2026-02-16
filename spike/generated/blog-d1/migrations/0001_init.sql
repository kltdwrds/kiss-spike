CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  published_at TEXT NOT NULL
);

-- Insert some sample data
INSERT OR IGNORE INTO posts (id, title, body, published_at) VALUES 
(
  'sample-1',
  'Welcome to My Blog',
  'This is my first blog post! I''m excited to share my thoughts and experiences with you.\n\nThis blog will cover a variety of topics including technology, programming, and personal reflections. I hope you find the content interesting and valuable.\n\nStay tuned for more posts coming soon!',
  '2024-01-15T10:00:00Z'
),
(
  'sample-2', 
  'The Future of Web Development',
  'Web development is constantly evolving, and it''s fascinating to see how far we''ve come.\n\nFrom simple HTML pages to complex, interactive applications that run in the browser, the web has transformed into a powerful platform for building amazing user experiences.\n\nSome exciting trends I''m watching include server-side rendering frameworks, edge computing, and the continued evolution of JavaScript and TypeScript.\n\nWhat trends are you most excited about?',
  '2024-01-10T15:30:00Z'
);