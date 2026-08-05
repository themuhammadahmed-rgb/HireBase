import React, { useState } from 'react';
import { useApp } from './AppContext';

export default function AddCandidateForm() {
  // Grab fetchCandidates from global context (no props needed!)
  const { fetchCandidates } = useApp();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    stage: '',
    appliedDate: '',
  });
  const [resumeFile, setResumeFile] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      if (errors.resume) setErrors({ ...errors, resume: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email format.';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required.';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Enter a valid phone number (min 10 digits).';
    }

    if (!formData.stage) {
      newErrors.stage = 'Please select a pipeline stage.';
    }

    if (!formData.appliedDate) {
      newErrors.appliedDate = 'Please pick an application date.';
    }

    if (!resumeFile) {
      newErrors.resume = 'Please upload a resume file (PDF or Image).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({ type: '', message: '' });

    if (!validateForm()) {
      setToast({ type: 'error', message: 'Please fix the errors in the form before submitting.' });
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('stage', formData.stage);
    data.append('appliedDate', formData.appliedDate);
    data.append('resume', resumeFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/candidates', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        }
        setToast({ type: 'error', message: result.message || 'Submission failed on server.' });
      } else {
        setToast({ type: 'success', message: 'Candidate added successfully!' });
        
        setFormData({ fullName: '', email: '', phone: '', stage: '', appliedDate: '' });
        setResumeFile(null);
        setErrors({});
        
        // Refresh candidates globally across the whole app
        await fetchCandidates();
      }
    } catch (error) {
      setToast({ type: 'error', message: 'Network error. Please ensure the backend server is running.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md border border-gray-100 text-left">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Candidate</h2>

      {toast.message && (
        <div className={`p-4 mb-6 rounded-lg font-medium text-sm transition-all ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full p-2.5 border rounded-lg focus:ring-2 outline-none ${
              errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
            }`}
            placeholder="e.g. Jane Doe"
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2.5 border rounded-lg focus:ring-2 outline-none ${
              errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
            }`}
            placeholder="jane@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full p-2.5 border rounded-lg focus:ring-2 outline-none ${
              errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
            }`}
            placeholder="+1 555-0192"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Pipeline Stage</label>
          <select
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className={`w-full p-2.5 border rounded-lg focus:ring-2 outline-none ${
              errors.stage ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
            }`}
          >
            <option value="">-- Select Stage --</option>
            <option value="Applied">Applied</option>
            <option value="Screening">Screening</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offer Extended">Offer Extended</option>
            <option value="Hired">Hired</option>
          </select>
          {errors.stage && <p className="text-red-500 text-xs mt-1">{errors.stage}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Application Date</label>
          <input
            type="date"
            name="appliedDate"
            value={formData.appliedDate}
            onChange={handleChange}
            className={`w-full p-2.5 border rounded-lg focus:ring-2 outline-none ${
              errors.appliedDate ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
            }`}
          />
          {errors.appliedDate && <p className="text-red-500 text-xs mt-1">{errors.appliedDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Resume (PDF or Image)</label>
          <input
            type="file"
            accept=".pdf, .png, .jpeg, .jpg"
            onChange={handleFileChange}
            className={`w-full p-2 border rounded-lg focus:ring-2 outline-none ${
              errors.resume ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
            }`}
          />
          {errors.resume && <p className="text-red-500 text-xs mt-1">{errors.resume}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 mt-4 font-semibold text-white rounded-lg transition duration-200 flex items-center justify-center ${
            loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting Candidate...
            </>
          ) : (
            'Add Candidate'
          )}
        </button>
      </form>
    </div>
  );
}