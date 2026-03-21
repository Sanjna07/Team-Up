export default function Navbar({ onLoginClick, onSignUpClick, onNavClick }) {
  const navLinks = ['Home', 'Rooms', 'About', 'Contact'];

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                Team
              </h1>
              <img src="https://res.cloudinary.com/dx0r0pbgb/image/upload/v1771960017/output-onlinepngtools_yyxzd0.png" alt="TeamUp Logo" className="ml-1 w-8 h-12" />
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

        {/* Centered pill nav between logo and auth buttons (hidden on small screens) */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="rounded-full border-2 border-emerald-700 px-4 py-1 bg-transparent">
            <div className="flex gap-2">
              {navLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => onNavClick(link)}
                  className="px-8 py-2 rounded-full text-sm font-medium transition-colors text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
