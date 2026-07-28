import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:5000/api/candidates'

function CandidateManager() {
  const [candidates, setCandidates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('Applied')

  // Fetch all candidates
  const fetchCandidates = () => {
    setIsLoading(true)
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setCandidates(data)
        setIsLoading(false)
      })
      .catch(() => {
        setError('Could not load candidates. Is the backend running?')
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  // Create candidate
  const handleAddCandidate = (e) => {
    e.preventDefault()
    if (!name || !role) return

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role, status })
    })
      .then(res => res.json())
      .then(() => {
        setName('')
        setRole('')
        setStatus('Applied')
        fetchCandidates()
      })
      .catch(() => setError('Failed to add candidate.'))
  }

  // Update candidate status (PUT request)
  const handleStatusChange = (id, newStatus) => {
    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => fetchCandidates())
      .catch(() => setError('Failed to update status.'))
  }

  // Delete candidate
  const handleDelete = (id) => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(() => fetchCandidates())
      .catch(() => setError('Failed to delete candidate.'))
  }

  // Helper for status badge colors
  const getBadgeStyle = (currentStatus) => {
    switch (currentStatus) {
      case 'Hired':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'Interviewing':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300'
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-300'
    }
  }

  return (
    <section id="candidates" className="px-6 py-16 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
          Live CRUD Demo
        </span>
        <h2 className="text-3xl font-bold text-slate-900">
          Candidate Pipeline
        </h2>
        <p className="text-slate-600 mt-2">
          Add candidates, change hiring stages in real-time, or remove records.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddCandidate} className="flex flex-col sm:flex-row gap-3 mb-10 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="Candidate name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-slate-800 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Hired">Hired</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button
          type="submit"
          className="bg-indigo-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Add
        </button>
      </form>

      {isLoading && <p className="text-center text-slate-500">Loading candidates...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {/* Candidates List */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {candidates.map(candidate => (
            <div
              key={candidate.id}
              className="flex items-center justify-between border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              <div>
                <p className="font-semibold text-slate-900 text-base">{candidate.name}</p>
                <p className="text-slate-500 text-sm">{candidate.role}</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Interactive Status Dropdown Pill */}
                <select
                  value={candidate.status}
                  onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border outline-none cursor-pointer transition ${getBadgeStyle(candidate.status)}`}
                >
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button
                  onClick={() => handleDelete(candidate.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm font-medium px-2 py-1 rounded transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default CandidateManager