import { useState, useEffect } from 'react'

function JobListings() {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
fetch('https://remotive.com/api/remote-jobs')
      .then(response => response.json())
      .then(data => {
        setJobs(data.jobs)
        setIsLoading(false)
      })
      .catch(err => {
        setError('Failed to load jobs. Please try again later.')
        setIsLoading(false)
      })
  }, [])

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <section id="jobs" className="px-8 py-24 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <span className="inline-block bg-indigo-100 text-indigo-600 text-sm font-medium px-3 py-1 rounded-full mb-4">
            Live Data
          </span>
          <h2 className="text-3xl font-bold text-slate-900">
            Live Job Openings
          </h2>
          <p className="text-slate-600 mt-4 max-w-xl mx-auto">
            Real, live remote job postings — powered by the Remotive API, updating in real time.
          </p>
        </div>

        <div className="relative max-w-md mx-auto my-10">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search jobs by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-300 rounded-lg pl-11 pr-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 mt-4">Loading jobs...</p>
          </div>
        )}

        {error && (
          <p className="text-center py-16 text-red-600 bg-red-50 rounded-xl">{error}</p>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {filteredJobs.slice(0, 10).map(job => (
             <a 
                key={job.id}
                href={job.url}
                target="_blank"
                rel="noreferrer"
                className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{job.title}</h3>
                    <p className="text-slate-600 text-sm mt-1">{job.company_name}</p>
                  </div>
                  <span className="shrink-0 bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    Remote
                  </span>
                </div>
              </a>
            ))}

            {filteredJobs.length === 0 && (
              <p className="text-center text-slate-500 py-8">No jobs match your search.</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default JobListings