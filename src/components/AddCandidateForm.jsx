import React, { useState } from 'react';

export default function AddCandidateForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'Frontend',
    stage: 'Applied',
    appliedDate: new Date().toISOString().split('T')[0]
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    // PREVENT TOP-OF-PAGE SCROLL
    e.preventDefault();
    e.stopPropagation();

    if (!resumeFile) {
      setStatus('Please upload a resume file.');
      return;
    }

    setLoading(true);
    setStatus('');

    const body = new FormData();
    body.append('fullName', formData.fullName);
    body.append('email', formData.email);
    body.append('phone', formData.phone);
    body.append('role', formData.role);
    body.append('stage', formData.stage);
    body.append('appliedDate', formData.appliedDate);
    body.append('resume', resumeFile);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5001/api/candidates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('Candidate added successfully!');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          role: 'Frontend',
          stage: 'Applied',
          appliedDate: new Date().toISOString().split('T')[0]
        });
        setResumeFile(null);

        // DISPATCH EVENT FOR REAL-TIME ANALYTICS REFRESH
        window.dispatchEvent(new Event('candidateAdded'));
      } else {
        setStatus(data.error || 'Failed to add candidate.');
      }
    } catch (err) {
      setStatus('Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl max-w-4xl mx-auto my-6 text-white">
      <h2 className="text-xl font-bold mb-4">Add Candidate (Validation & Upload)</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
          <input
            type="text"
            required
            placeholder="Muhammad Ahmed"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
          <input
            type="email"
            required
            placeholder="bhaikiahalhai@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
          <input
            type="text"
            required
            placeholder="+923056662253"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Job Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
          >
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Fullstack">Fullstack</option>
            <option value="Design">Design</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Pipeline Stage</label>
          <select
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
          >
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Hired">Hired</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Application Date</label>
          <input
            type="date"
            required
            value={formData.appliedDate}
            onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-400 mb-1">Resume File (PDF / Image)</label>
          <input
            type="file"
            required
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setResumeFile(e.target.files[0])}
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 bg-indigo-600 hover:bg-indigo-500 font-semibold py-3 rounded-xl transition-all disabled:opacity-50 mt-2"
        >
          {loading ? 'Submitting...' : 'Submit Candidate'}
        </button>

        {status && (
          <p className="md:col-span-2 text-center text-sm font-medium text-emerald-400 mt-2">
            {status}
          </p>
        )}
      </form>
    </div>
  );
}