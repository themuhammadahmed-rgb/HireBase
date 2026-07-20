function Hero() {
  return (
    <section className="text-center px-8 py-24 bg-slate-50">
      <h1 className="text-5xl font-bold text-slate-900 max-w-3xl mx-auto">
        Hire smarter, not harder.
      </h1>
      <p className="text-lg text-slate-600 mt-6 max-w-xl mx-auto">
        Hirebase brings your candidate pipeline, interviews, and hiring analytics into one place — so your team can focus on finding great talent, not managing spreadsheets.
      </p>
      <div className="flex justify-center gap-4 mt-10">
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
          Start Free Trial
        </button>
        <button className="bg-white text-slate-900 px-6 py-3 rounded-lg border border-slate-300 hover:bg-slate-100">
          Watch Demo
        </button>
      </div>
    </section>
  )
}

export default Hero