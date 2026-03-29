import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';
import Contact from './components/Contact.jsx';
import About from './components/About.jsx';

function App({ initialSection = 'Home', hideNavFooter = false }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [activeSection, setActiveSection] = useState(initialSection);

  const handleLoginClick = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleNavClick = (link) => {
    if (link === 'Rooms') {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    setActiveSection(link);
  };

  return (
    <div className="min-h-screen">
      {!hideNavFooter && (
        <Navbar
          onLoginClick={handleLoginClick}
          onSignUpClick={handleSignUpClick}
          onNavClick={handleNavClick}
        />
      )}
      {activeSection === 'Contact' ? (
        <Contact standalone={hideNavFooter} />
      ) : activeSection === 'About' ? (
        <About />
      ) : (
        <Hero
          onGetStarted={handleSignUpClick}
          onLearnMore={() => setActiveSection('About')}
        />
      )}
      {!hideNavFooter && <Footer />}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default App;
