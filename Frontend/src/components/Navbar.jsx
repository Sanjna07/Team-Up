export default function Navbar({ onLoginClick, onSignUpClick }) {
  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              TeamUp
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onLoginClick}
              className="text-gray-700 hover:text-emerald-700 font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={onSignUpClick}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
