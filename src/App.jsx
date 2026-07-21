import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import JobListings from './components/JobListings'
import Pricing from './components/Pricing'
import About from './components/About'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <JobListings />
      <Pricing />
      <About />
      <Footer />
    </div>
  )
}

export default App