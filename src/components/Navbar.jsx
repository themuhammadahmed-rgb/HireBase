import { useState } from 'react'

function Navbar({ userEmail, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-8 py-4 border-b border-slate-200">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-indigo-600">
          Hirebase
        </div>

        <div className="hidden md:flex gap-8 text-slate-600 font-medium text-sm">
          <a href="#features" className="hover:text-indigo-600 transition">Features</a>
          <a href="#pricing" className="hover:text-indigo-600 transition">Pricing</a>
          <a href="#about" className="hover:text-indigo-600 transition">About</a>
        </div>

        {/* Right Header Controls */}
        <div className="hidden md:flex items-center gap-4">
          {userEmail ? (
            <div className="flex items-center gap-3 bg-slate-100 pl-3 pr-1 py-1 rounded-full border border-slate-200">
              <span className="text-xs font-semibold text-slate-700 max-w-[160px] truncate">
                {userEmail}
              </span>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <a
              href="#candidate-section"
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Get Started
            </a>
          )}
        </div>

        <button
          className="md:hidden text-slate-900"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col gap-4 mt-4 pb-2">
          <a href="#features" className="text-slate-600 hover:text-indigo-600">Features</a>
          <a href="#pricing" className="text-slate-600 hover:text-indigo-600">Pricing</a>
          <a href="#about" className="text-slate-600 hover:text-indigo-600">About</a>
          
          {userEmail ? (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-600 truncate">{userEmail}</span>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg"
              >
                Logout
              </button>
            </div>
          ) : (
            <a
              href="#candidate-section"
              className="bg-indigo-600 text-white text-center px-5 py-2 rounded-lg hover:bg-indigo-700"
            >
              Get Started
            </a>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar