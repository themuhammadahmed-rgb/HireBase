function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-200">
      <div className="text-2xl font-bold text-indigo-600">
        Hirebase
      </div>
      <div className="flex gap-8 text-slate-600">
        <a href="#features" className="hover:text-indigo-600">Features</a>
        <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
        <a href="#about" className="hover:text-indigo-600">About</a>
      </div>
      <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">
        Get Started
      </button>
    </nav>
  )
}

export default Navbar