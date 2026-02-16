export function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a 
            href="/" 
            className="text-xl font-bold text-gray-900 hover:text-blue-600"
          >
            My Blog
          </a>
          
          <div className="flex items-center space-x-6">
            <a 
              href="/" 
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Home
            </a>
            <a 
              href="/admin" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}