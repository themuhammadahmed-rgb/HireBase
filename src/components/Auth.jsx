import { useState } from 'react';

// Fixed API URL to point to backend server on port 5001
const API_URL = 'http://127.0.0.1:5001/api/auth';

function Auth({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const endpoint = isSignup ? `${API_URL}/signup` : `${API_URL}/login`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || data.message || 'Authentication failed.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user.email);
      onLoginSuccess(data.user.email);
    } catch (err) {
      setLoading(false);
      setError('Backend unreachable. Is the backend server running on port 5001?');
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-md">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        {isSignup ? 'Create an Account' : 'Login to Access Candidate Pipeline'}
      </h2>
      <p className="text-slate-500 text-center mb-6 text-sm">
        {isSignup ? 'Sign up to unlock protected candidate data' : 'This section is protected. Please log in.'}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Min. 6 characters"
            className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Log In'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => { setIsSignup(!isSignup); setError(''); }}
          className="text-indigo-600 font-semibold hover:underline"
        >
          {isSignup ? 'Log In' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}

export default Auth;