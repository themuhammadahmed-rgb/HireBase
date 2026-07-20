function Pricing() {
  return (
    <section id="pricing" className="px-8 py-24 bg-slate-50">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-slate-900">
          Simple, transparent pricing
        </h2>
        <p className="text-slate-600 mt-4 max-w-xl mx-auto">
          Choose the plan that fits your team. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-slate-900">Starter</h3>
          <p className="text-3xl font-bold text-slate-900 mt-4">$29<span className="text-lg font-normal text-slate-500">/mo</span></p>
          <p className="text-slate-600 mt-2">For small teams getting started</p>
          <button className="w-full bg-slate-100 text-slate-900 px-5 py-2 rounded-lg mt-6 hover:bg-slate-200">
            Get Started
          </button>
        </div>

        <div className="bg-white border-2 border-indigo-600 rounded-xl p-8 relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-sm px-3 py-1 rounded-full">
            Most Popular
          </span>
          <h3 className="text-xl font-semibold text-slate-900">Growth</h3>
          <p className="text-3xl font-bold text-slate-900 mt-4">$79<span className="text-lg font-normal text-slate-500">/mo</span></p>
          <p className="text-slate-600 mt-2">For growing hiring teams</p>
          <button className="w-full bg-indigo-600 text-white px-5 py-2 rounded-lg mt-6 hover:bg-indigo-700">
            Get Started
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-slate-900">Enterprise</h3>
          <p className="text-3xl font-bold text-slate-900 mt-4">Custom</p>
          <p className="text-slate-600 mt-2">For large organizations</p>
          <button className="w-full bg-slate-100 text-slate-900 px-5 py-2 rounded-lg mt-6 hover:bg-slate-200">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  )
}

export default Pricing