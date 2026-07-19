function Features() {
  return (
    <section id="features" className="px-8 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-slate-900">
          Everything you need to hire well
        </h2>
        <p className="text-slate-600 mt-4 max-w-xl mx-auto">
          Powerful tools that help your team move faster, without losing the human side of hiring.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Smart Candidate Pipeline</h3>
          <p className="text-slate-600">Track every candidate from applied to hired with a clear, visual pipeline your whole team can see.</p>
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">AI Resume Screening</h3>
          <p className="text-slate-600">Automatically shortlist candidates that match your job criteria, so you spend time on the right people.</p>
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Interview Scheduling</h3>
          <p className="text-slate-600">Sync calendars and send reminders automatically — no more back-and-forth emails.</p>
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Analytics Dashboard</h3>
          <p className="text-slate-600">See time-to-hire, pipeline conversion, and source-of-hire data at a glance.</p>
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Integrations</h3>
          <p className="text-slate-600">Connect Hirebase with Slack, Google Calendar, and Zoom to fit right into your workflow.</p>
        </div>
      </div>
    </section>
  )
}

export default Features