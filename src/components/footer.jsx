function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 px-8 py-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-xl font-bold text-white">
          Hirebase
        </div>

        <div className="flex gap-6">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#about" className="hover:text-white">About</a>
        </div>

        <div className="text-sm text-slate-400">
          © 2026 Hirebase. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer