import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// main.jsx — Application entry point
//
// StrictMode helps catch potential issues during development by intentionally
// double-invoking certain lifecycle methods. It has no effect in production.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
