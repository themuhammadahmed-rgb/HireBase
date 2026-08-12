import React, { useState, useEffect, useRef } from 'react';

export default function CandidateManager() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Frontend');
  const [stage, setStage] = useState('Applied');
  const [appliedDate, setAppliedDate] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Scroll Preservation
  const scrollPos = useRef(0);

  const saveScroll = () => {
    scrollPos.current = window.scrollY || document.documentElement.scrollTop;
  };

  const restoreScroll = () => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPos.current, behavior: 'instant' });
    });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchCandidates = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://127.0.0.1:5001/api/candidates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setCandidates(data);
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCandidates();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveScroll();

    if (!resumeFile) {
      alert('Please select a resume file before submitting.');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('role', role);
    formData.append('stage', stage);
    formData.append('appliedDate', appliedDate);
    formData.append('resume', resumeFile);

    try {
      const res = await fetch('http://127.0.0.1:5001/api/candidates', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const newCandidate = await res.json();
        setCandidates((prev) => [newCandidate, ...prev]);

        setFullName('');
        setEmail('');
        setPhone('');
        setRole('Frontend');
        setStage('Applied');
        setAppliedDate('');
        setResumeFile(null);

        // Notify Dashboard to quietly update analytics in the background
        window.dispatchEvent(new Event('candidateAdded'));
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to submit candidate.');
      }
    } catch (err) {
      console.error('Error submitting candidate:', err);
    } finally {
      setSubmitting(false);
      restoreScroll();
    }
  };

  const handleStageChange = async (e, candidateId, newStage) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    saveScroll();

    setCandidates((prev) =>
      prev.map((c) => (c._id === candidateId ? { ...c, stage: newStage } : c))
    );

    restoreScroll();

    const token = localStorage.getItem('token');
    try {
      await fetch(`http://127.0.0.1:5001/api/candidates/${candidateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stage: newStage })
      });
      window.dispatchEvent(new Event('candidateAdded'));
    } catch (err) {
      console.error('Failed to update stage on server:', err);
    }
  };

  const handleDelete = async (e, candidateId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    saveScroll();

    setCandidates((prev) => prev.filter((c) => c._id !== candidateId));
    restoreScroll();

    const token = localStorage.getItem('token');
    try {
      await fetch(`http://127.0.0.1:5001/api/candidates/${candidateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      window.dispatchEvent(new Event('candidateAdded'));
    } catch (err) {
      console.error('Failed to delete candidate:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* FORM CARD */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', color: '#0f172a', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Muhammad Ahmed"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bhaikiahalhai@gmail.com"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+923056662253"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Job Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Fullstack">Fullstack</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Pipeline Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Hired">Hired</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Application Date</label>
              <input
                type="date"
                required
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', outline: 'none', colorScheme: 'light' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Resume File (PDF / Image)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}>
              <label style={{ backgroundColor: '#eff6ff', color: '#4338ca', fontWeight: '600', fontSize: '13px', padding: '6px 14px', borderRadius: '6px', border: '1px solid #c7d2fe', cursor: 'pointer' }}>
                Choose File
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {resumeFile ? resumeFile.name : 'No file chosen'}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              backgroundColor: '#4338ca',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '15px',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '6px',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Candidate'}
          </button>
        </form>
      </div>

      {/* PIPELINE CONTAINER */}
      <div style={{ backgroundColor: '#131b2e', borderRadius: '16px', padding: '28px', border: '1px solid #1e293b', color: '#ffffff', minHeight: '300px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Candidate Pipeline</h2>

        {loading ? (
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading pipeline...</p>
        ) : candidates.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '36px 0' }}>
            No candidates found in pipeline.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {candidates.map((candidate) => (
              <div
                key={candidate._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                  border: '1px solid #334155'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: '#ffffff' }}>{candidate.fullName}</span>
                    <span style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>
                      {candidate.role}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                    {candidate.email} • {candidate.phone}
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Applied: {candidate.appliedDate}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    value={candidate.stage}
                    onChange={(e) => handleStageChange(e, candidate._id, e.target.value)}
                    style={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      border: '1px solid #334155',
                      fontSize: '13px',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Hired">Hired</option>
                  </select>

                  {candidate.resumeUrl && (
                    <a
                      href={`http://127.0.0.1:5001${candidate.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#312e81',
                        color: '#c7d2fe',
                        fontSize: '13px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        textDecoration: 'none'
                      }}
                    >
                      Resume
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, candidate._id)}
                    style={{
                      backgroundColor: '#450a0a',
                      color: '#fca5a5',
                      fontSize: '13px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}