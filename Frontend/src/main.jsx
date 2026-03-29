import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Welcome from './Welcome.jsx';
import Dashboard from './Dashboard.jsx';
import Profile from './Profile.jsx';
import Settings from './Settings.jsx';
import Quiz from './Quiz.jsx';
import Matchmaking from './Matchmaking.jsx';
import CommunityChat from './CommunityChat.jsx';
import './index.css';

const path = window.location.pathname;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {path === '/dashboard' ? (
      <Dashboard />
    ) : path === '/profile' ? (
      <Profile />
    ) : path === '/settings' ? (
      <Settings />
    ) : path === '/quiz' ? (
      <Quiz />
    ) : path === '/matchmaking' ? (
      <Matchmaking />
    ) : path === '/community' ? (
      <CommunityChat />
    ) : path === '/welcome' ? (
      <Welcome />
    ) : path === '/contact' ? (
       <App initialSection="Contact" hideNavFooter={true} />
     ) : path === '/about' ? (
      <App initialSection="About" />
    ) : (
      <App />
    )}
  </StrictMode>
);
