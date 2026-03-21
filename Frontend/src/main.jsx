import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Welcome from './Welcome.jsx';
import Dashboard from './Dashboard.jsx';
import './index.css';

const path = window.location.pathname;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {path === '/dashboard' ? <Dashboard /> : path === '/welcome' ? <Welcome /> : <App />}
  </StrictMode>
);
