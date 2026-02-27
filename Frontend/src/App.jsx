import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleLoginClick = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar
        onLoginClick={handleLoginClick}
        onSignUpClick={handleSignUpClick}
      />
      <Hero onGetStarted={handleSignUpClick} />
      <Footer />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default App;
