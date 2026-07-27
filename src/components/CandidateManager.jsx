import React, { useState, useEffect } from 'react';

const CandidateManager = () => {
  const [candidates, setCandidates] = useState([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api/candidates';

  // Fetch candidates on load
  const fetchCandidates = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCandidates(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Add Candidate
  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!name || !role) return;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, status }),
      });
      if (res.ok) {
        setName('');
        setRole('');
        setStatus('Applied');
        fetchCandidates();
      }
    } catch (err) {
      console.error('Error adding candidate:', err);
    }
  };

  // Update Status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchCandidates();
      }
    } catch (err) {
      console.error('Error updating candidate:', err);
    }
  };

  // Delete Candidate
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCandidates();
      }
    } catch (err) {
      console.error('Error deleting candidate:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Hired':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Interviewing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            Interactive Demo
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Candidate Pipeline Manager
          </h2>
          <p className="mt-2 text-slate-600">
            Test full CRUD capabilities connected live to your Express API.
          </p>
        </div>

        {/* Input Form */}
        <form 
          onSubmit={handleAddCandidate}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <input
            type="text"
            placeholder="Candidate Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 transition"
          />
          <input
            type="text"
            placeholder="Role (e.g. React Developer)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 transition"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 bg-white transition"
          >
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow transition duration-200"
          >
            + Add Candidate
          </button>
        </form>

        {/* Candidates List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Active Candidates</h3>
            <span className="text-xs font-medium text-slate-500">
              Total: {candidates.length}
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading candidates...</div>
          ) : candidates.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No candidates added yet. Fill out the form above to get started!
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {candidates.map((candidate) => (
                <li key={candidate.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{candidate.name}</h4>
                    <p className="text-sm text-slate-500">{candidate.role}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status dropdown */}
                    <select
                      value={candidate.status}
                      onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer outline-none transition ${getStatusBadge(candidate.status)}`}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(candidate.id)}
                      className="text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-md transition"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </section>
  );
};

export default CandidateManager;