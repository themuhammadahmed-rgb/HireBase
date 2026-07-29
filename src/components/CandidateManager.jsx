import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:5000/api/candidates'

function CandidateManager() {
  const [candidates, setCandidates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('Applied')

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const fetchCandidates = () => {
    setIsLoading(true)
    fetch(API_URL, { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized or Session Expired')
        return res.json()
      })
      .then(data => {
        setCandidates(data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Could not load candidates.')
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const handleAddCandidate = (e) => {
    e.preventDefault()
    if (!name || !role) return

    fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
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

  const handleStatusChange = (id, newStatus) => {
    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => fetchCandidates())
      .catch(() => setError('Failed to update status.'))
  }

  const handleDelete = (id) => {
    fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
      .then(() => fetchCandidates())
      .catch(() => setError('Failed to delete candidate.'))
  }

  const getBadgeStyle = (currentStatus) => {
    switch (currentStatus) {
      case 'Hired': return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'Interviewing': return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Rejected': return 'bg-rose-100 text-rose-800 border-rose-300'
      default: return 'bg-indigo-100 text-indigo-800 border-indigo-300'
    }
  }

  return (
    <section id="candidates" className="px-6 py-4 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
          Protected Workspace
        </span>
        <h2 className="text-3xl font-bold text-slate-900">
          Candidate Pipeline
        </h2>
      </div>

      <form onSubmit={handleAddCandidate} className="flex flex-col sm:flex-row gap-3 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
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

      {isLoading && <p className="text-center text-slate-500">Loading protected data...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!isLoading && !error && (
        <div className="space-y-3">
          {candidates.length === 0 ? (
            <p className="text-center text-slate-400 py-6">No candidates found in pipeline.</p>
          ) : (
            candidates.map(candidate => {
              const candidateId = candidate._id || candidate.id;
              return (
                <div
                  key={candidateId}
                  className="flex items-center justify-between border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:border-slate-300 transition"
                >
                  <div>
                    <p className="font-semibold text-slate-900 text-base">{candidate.name}</p>
                    <p className="text-slate-500 text-sm">{candidate.role}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={candidate.status}
                      onChange={(e) => handleStatusChange(candidateId, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border outline-none cursor-pointer transition ${getBadgeStyle(candidate.status)}`}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <button
                      onClick={() => handleDelete(candidateId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm font-medium px-2 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  )
}

export default CandidateManager