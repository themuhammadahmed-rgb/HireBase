import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import JobListings from './components/JobListings';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import Auth from './components/Auth';
import CandidateManager from './components/CandidateManager';
import FileUpload from './components/FileUpload';
import Dashboard from "./components/DashBoard";

function App() {
  const [userEmail, setUserEmail] = useState(null);
  
  // Track scroll position dynamically
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll position across child updates
  useLayoutEffect(() => {
    if (scrollPositionRef.current > 0) {
      window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('userEmail');
    if (token && savedEmail) {
      setUserEmail(savedEmail);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUserEmail(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 antialiased">
      <Navbar userEmail={userEmail} onLogout={handleLogout} />

      <Hero />
      <About />
      <Features />

      {/* Analytics Dashboard Section */}
      <section id="dashboard" className="py-12 bg-slate-900 border-t border-slate-800 min-h-[900px]">
        <Dashboard />
      </section>

      {/* Standalone File Upload Section */}
      <section className="py-12 bg-slate-950 border-t border-slate-800">
        <FileUpload />
      </section>

      {/* Protected Section */}
      <section id="candidate-section" className="py-12 bg-slate-900 border-y border-slate-800 min-h-[600px]">
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
  );
}

export default App;