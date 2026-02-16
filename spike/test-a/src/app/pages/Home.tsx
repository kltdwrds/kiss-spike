export function Home() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Hello World</h1>
      <p className="text-lg text-gray-600 mb-8">
        Welcome to this RedwoodSDK app running on Cloudflare Workers.
      </p>
      <a
        href="/about"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        About This App
      </a>
    </div>
  );
}
