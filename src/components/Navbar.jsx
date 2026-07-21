import { useState } from 'react'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="px-8 py-4 border-b border-slate-200">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-indigo-600">
          Hirebase
        </div>

        <div className="hidden md:flex gap-8 text-slate-600">
          <a href="#features" className="hover:text-indigo-600">Features</a>
          <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
          <a href="#about" className="hover:text-indigo-600">About</a>
        </div>

        <button className="hidden md:block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">
          Get Started
        </button>

        <button
          className="md:hidden text-slate-900"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden flex flex-col gap-4 mt-4">
          <a href="#features" className="text-slate-600 hover:text-indigo-600">Features</a>
          <a href="#pricing" className="text-slate-600 hover:text-indigo-600">Pricing</a>
          <a href="#about" className="text-slate-600 hover:text-indigo-600">About</a>
          <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">
            Get Started
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
