import React, { useEffect, useState, useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { Users, UserCheck, Calendar, Briefcase, Filter, UserPlus, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Quick Add Candidate State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ 
    fullName: '', 
    email: '', 
    phone: '',
    role: 'Frontend', 
    stage: 'Applied',
    appliedDate: new Date().toISOString().split('T')[0]
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [addStatus, setAddStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch analytics silently unless it is the very first load
  const fetchAnalytics = (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);

    fetch(`http://127.0.0.1:5001/api/analytics?filter=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        if (isInitialLoad) setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching analytics:', err);
        if (isInitialLoad) setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics(true);
    
    const handleGlobalUpdate = () => fetchAnalytics(false);
    window.addEventListener('candidateAdded', handleGlobalUpdate);
    return () => window.removeEventListener('candidateAdded', handleGlobalUpdate);
  }, [filter]);

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddStatus('');

    if (!resumeFile) {
      setAddStatus('Resume file is required.');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('fullName', newCandidate.fullName);
    formData.append('email', newCandidate.email);
    formData.append('phone', newCandidate.phone || '+10000000000');
    formData.append('role', newCandidate.role);
    formData.append('stage', newCandidate.stage);
    formData.append('appliedDate', newCandidate.appliedDate);
    formData.append('resume', resumeFile);

    try {
      const res = await fetch('http://127.0.0.1:5001/api/candidates', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData,
      });

      const responseData = await res.json();

      if (res.ok) {
        setAddStatus('Candidate added successfully!');
        setNewCandidate({ 
          fullName: '', 
          email: '', 
          phone: '',
          role: 'Frontend', 
          stage: 'Applied',
          appliedDate: new Date().toISOString().split('T')[0]
        });
        setResumeFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        setTimeout(() => {
          setAddStatus('');
          setShowAddForm(false);
        }, 1500);

        fetchAnalytics(false);
        window.dispatchEvent(new Event('candidateAdded'));
      } else {
        setAddStatus(responseData.error || 'Failed to add candidate.');
      }
    } catch (err) {
      console.error(err);
      setAddStatus('Error connecting to server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 font-medium min-h-[500px]">Loading recruitment analytics...</div>;
  }

  if (!data) {
    return <div className="p-12 text-center text-red-400 font-medium min-h-[500px]">Backend not connected. Make sure server is running on port 5001.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 min-h-[800px]">
      {/* Header & Controls */}
      <div className="p-6 bg-slate-800/90 rounded-2xl border border-slate-700 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Recruitment Analytics</h1>
            <p className="text-slate-400 text-sm mt-0.5">Real-time candidate pipeline metrics</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setShowAddForm(!showAddForm)} 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              {showAddForm ? 'Close Form' : 'Add Candidate'}
            </button>

            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-700">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-slate-200 font-medium text-sm focus:outline-none cursor-pointer pr-2"
              >
                <option value="all" className="bg-slate-900 text-white">All Time</option>
                <option value="recent" className="bg-slate-900 text-white">Recent Activity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Add Candidate Form */}
        {showAddForm && (
          <form onSubmit={handleAddCandidate} className="pt-4 border-t border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="John Doe" 
                value={newCandidate.fullName} 
                onChange={(e) => setNewCandidate({ ...newCandidate, fullName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
              <input 
                type="email" 
                required 
                placeholder="john@example.com" 
                value={newCandidate.email} 
                onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Phone</label>
              <input 
                type="text" 
                required
                placeholder="+1234567890" 
                value={newCandidate.phone} 
                onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Role</label>
              <select 
                value={newCandidate.role} 
                onChange={(e) => setNewCandidate({ ...newCandidate, role: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Fullstack">Fullstack</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Stage</label>
              <select 
                value={newCandidate.stage} 
                onChange={(e) => setNewCandidate({ ...newCandidate, stage: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Hired">Hired</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Applied Date</label>
              <input 
                type="date" 
                required 
                value={newCandidate.appliedDate} 
                onChange={(e) => setNewCandidate({ ...newCandidate, appliedDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Resume File</label>
              <input 
                ref={fileInputRef}
                type="file" 
                required
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white cursor-pointer"
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-2 px-4 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Candidate'}
            </button>

            {addStatus && (
              <p className="text-xs text-emerald-400 col-span-full flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {addStatus}
              </p>
            )}
          </form>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Applications" value={data?.stats?.totalApplications || 0} icon={<Users className="text-blue-400" />} color="bg-blue-500/10 border-blue-500/20" />
        <StatCard title="Shortlisted" value={data?.stats?.shortlisted || 0} icon={<UserCheck className="text-emerald-400" />} color="bg-emerald-500/10 border-emerald-500/20" />
        <StatCard title="Interviews Scheduled" value={data?.stats?.interviews || 0} icon={<Calendar className="text-purple-400" />} color="bg-purple-500/10 border-purple-500/20" />
        <StatCard title="Hired Candidates" value={data?.stats?.hired || 0} icon={<Briefcase className="text-amber-400" />} color="bg-amber-500/10 border-amber-500/20" />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line Chart */}
        <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-base font-bold text-white mb-4">Application Trends</h2>
          <div className="h-64 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <LineChart data={data?.applicationTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }} 
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Applications" />
                <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="Hires" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-base font-bold text-white mb-4">Applications by Role</h2>
          <div className="h-64 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <BarChart data={data?.categoryBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={false} 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }} 
                />
                <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} name="Candidates" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-xl lg:col-span-2">
          <h2 className="text-base font-bold text-white mb-4">Candidate Status Distribution</h2>
          <div className="h-72 min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <PieChart>
                <Pie 
                  data={data?.statusDistribution || []} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70} 
                  outerRadius={105} 
                  paddingAngle={4}
                >
                  {(data?.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#1e293b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold text-white mt-1">{value}</p>
      </div>
      <div className={`p-3.5 rounded-xl border ${color}`}>{icon}</div>
    </div>
  );
}