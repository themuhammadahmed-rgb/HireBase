import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:5000/api/candidates'

function CandidateManager() {
  const [candidates, setCandidates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    stage: 'Applied',
    appliedDate: '',
  })
  const [resumeFile, setResumeFile] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState({ type: '', message: '' })

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`
    }
  }

  const fetchCandidates = () => {
    setIsLoading(true)
    fetch(API_URL, { 
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      } 
    })
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' })
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setResumeFile(e.target.files[0])
      if (formErrors.resume) setFormErrors({ ...formErrors, resume: '' })
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required.'
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters.'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      errors.email = 'Email address is required.'
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required.'
    } else if (formData.phone.trim().length < 10) {
      errors.phone = 'Enter a valid phone number (min 10 digits).'
    }

    if (!formData.stage) {
      errors.stage = 'Please select a pipeline stage.'
    }

    if (!formData.appliedDate) {
      errors.appliedDate = 'Application date is required.'
    }

    if (!resumeFile) {
      errors.resume = 'Resume file (PDF, PNG, or JPG) is required.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddCandidate = (e) => {
    e.preventDefault()
    setToast({ type: '', message: '' })

    if (!validateForm()) {
      setToast({ type: 'error', message: 'Please resolve all validation errors before submitting.' })
      return
    }

    setIsSubmitting(true)

    const submissionData = new FormData()
    submissionData.append('fullName', formData.fullName)
    submissionData.append('email', formData.email)
    submissionData.append('phone', formData.phone)
    submissionData.append('stage', formData.stage)
    submissionData.append('appliedDate', formData.appliedDate)
    submissionData.append('resume', resumeFile)

    fetch(`${API_URL}/advanced`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: submissionData
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          if (data.errors) setFormErrors(data.errors)
          throw new Error(data.message || 'Server-side validation failed.')
        }
        return data
      })
      .then((data) => {
        setToast({ type: 'success', message: 'Candidate registered successfully!' })
        setFormData({ fullName: '', email: '', phone: '', stage: 'Applied', appliedDate: '' })
        setResumeFile(null)
        setFormErrors({})
        fetchCandidates()
      })
      .catch((err) => {
        setToast({ type: 'error', message: err.message || 'Failed to submit candidate.' })
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleStatusChange = (id, newStatus) => {
    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ stage: newStatus })
    })
      .then(res => res.json())
      .then(() => fetchCandidates())
      .catch(() => setError('Failed to update stage.'))
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
      case 'Screening': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'Offer Extended': return 'bg-blue-100 text-blue-800 border-blue-300'
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

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 text-left">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Add Candidate (Validation & Upload)</h3>
        
        {toast.message && (
          <div className={`p-3 mb-4 rounded-lg text-sm font-medium transition-all ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {toast.message}
          </div>
        )}

        <form onSubmit={handleAddCandidate} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Jane Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 ${
                  formErrors.fullName ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
              {formErrors.fullName && <p className="text-rose-500 text-xs mt-1">{formErrors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 ${
                  formErrors.email ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
              {formErrors.email && <p className="text-rose-500 text-xs mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="+1 555-0192"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 ${
                  formErrors.phone ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
              {formErrors.phone && <p className="text-rose-500 text-xs mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pipeline Stage</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 bg-white outline-none focus:ring-2 ${
                  formErrors.stage ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:ring-indigo-500'
                }`}
              >
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer Extended">Offer Extended</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
              {formErrors.stage && <p className="text-rose-500 text-xs mt-1">{formErrors.stage}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Date</label>
              <input
                type="date"
                name="appliedDate"
                value={formData.appliedDate}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 ${
                  formErrors.appliedDate ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
              {formErrors.appliedDate && <p className="text-rose-500 text-xs mt-1">{formErrors.appliedDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Resume File (PDF / Image)</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className={`w-full border rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white outline-none focus:ring-2 ${
                  formErrors.resume ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
              {formErrors.resume && <p className="text-rose-500 text-xs mt-1">{formErrors.resume}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-2 font-medium px-6 py-2.5 rounded-lg text-white transition flex items-center justify-center ${
              isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Validating & Submitting...
              </>
            ) : (
              'Submit Candidate'
            )}
          </button>
        </form>
      </div>

      {isLoading && <p className="text-center text-slate-500">Loading protected data...</p>}
      {error && <p className="text-center text-rose-600">{error}</p>}

      {!isLoading && !error && (
        <div className="space-y-3">
          {candidates.length === 0 ? (
            <p className="text-center text-slate-400 py-6">No candidates found in pipeline.</p>
          ) : (
            candidates.map(candidate => {
              const candidateId = candidate._id || candidate.id;
              const displayName = candidate.fullName || candidate.name;
              const displayStage = candidate.stage || candidate.status || 'Applied';

              return (
                <div
                  key={candidateId}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:border-slate-300 transition gap-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900 text-base">{displayName}</p>
                    <p className="text-slate-500 text-sm">
                      {candidate.email ? `${candidate.email} • ${candidate.phone || ''}` : candidate.role}
                    </p>
                    {candidate.appliedDate && (
                      <p className="text-slate-400 text-xs mt-1">Applied: {candidate.appliedDate}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <select
                      value={displayStage}
                      onChange={(e) => handleStatusChange(candidateId, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border outline-none cursor-pointer transition ${getBadgeStyle(displayStage)}`}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Screening">Screening</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offer Extended">Offer Extended</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <button
                      onClick={() => handleDelete(candidateId)}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 text-sm font-medium px-2 py-1 rounded transition"
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