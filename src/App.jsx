import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Features from './components/Features'
import JobListings from './components/JobListings'
import Pricing from './components/Pricing'
import Footer from './components/Footer'
import Auth from './components/Auth'
import CandidateManager from './components/CandidateManager'

function App() {
  const [userEmail, setUserEmail] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedEmail = localStorage.getItem('userEmail')
    if (token && savedEmail) {
      setUserEmail(savedEmail)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    setUserEmail(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Pass user state & logout handler directly to Navbar */}
      <Navbar userEmail={userEmail} onLogout={handleLogout} />

      <Hero />
      <About />
      <Features />

      {/* Protected Section */}
      <section id="candidate-section" className="py-12 bg-slate-100/60 border-y border-slate-200">
        {!userEmail ? (
          <Auth onLoginSuccess={(email) => setUserEmail(email)} />
        ) : (
          <CandidateManager />
        )}
      </section>

      <JobListings />
      <Pricing />
      <Footer />
    </div>
  )
}

export default App