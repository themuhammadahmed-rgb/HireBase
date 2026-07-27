import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/candidates';

export default function CandidateManager() {
  const [candidates, setCandidates] = useState([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');

  // 1. READ: Fetch candidates from backend on load
  const fetchCandidates = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCandidates(data);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // 2. CREATE: Add a new candidate
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
        fetchCandidates(); // Refresh list automatically
      }
    } catch (err) {
      console.error('Error adding candidate:', err);
    }
  };

  // 3. UPDATE: Change candidate status via dropdown
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchCandidates();
    } catch (err) {
      console.error('Error updating candidate:', err);
    }
  };

  // 4. DELETE: Remove candidate from backend
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCandidates();
    } catch (err) {
      console.error('Error deleting candidate:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Candidate Pipeline (CRUD Demo)</h2>

      {/* CREATE FORM */}
      <form onSubmit={handleAddCandidate} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <input
          type="text"
          placeholder="Candidate Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Role (e.g. React Dev)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Hired">Hired</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Candidate
        </button>
      </form>

      {/* CANDIDATE LIST */}
      <div className="space-y-3">
        {candidates.map((c) => (
          <div key={c.id} className="flex flex-col sm:flex-row justify-between items-center p-3 border rounded bg-gray-50">
            <div>
              <p className="font-semibold text-gray-900">{c.name}</p>
              <p className="text-sm text-gray-500">{c.role}</p>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <select
                value={c.status}
                onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                className="border p-1 rounded text-sm bg-white"
              >
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button
                onClick={() => handleDelete(c.id)}
                className="bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}