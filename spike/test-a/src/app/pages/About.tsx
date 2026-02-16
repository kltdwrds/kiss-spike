export function About() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">About</h1>
      <p className="text-gray-600 mb-4">
        This is a simple RedwoodSDK application demonstrating server-rendered React
        components with Tailwind CSS styling, deployed to Cloudflare Workers.
      </p>
      <p className="text-gray-600 mb-8">
        RedwoodSDK uses React Server Components by default — all components run on
        the server unless explicitly marked with "use client".
      </p>
      <a
        href="/"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        &larr; Back to Home
      </a>
    </div>
  );
}
