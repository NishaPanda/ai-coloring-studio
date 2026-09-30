import { useState, useEffect } from 'react';
import api from './services/api';
import './index.css';

// App.jsx — Root component
//
// For now this is a simple connection test page.
// In Phase 2, we will replace this with proper routing and pages.

function App() {
  const [apiStatus, setApiStatus] = useState('Checking connection...');

  useEffect(() => {
    // Call the test route on the backend to verify communication
    api.get('/test')
      .then((res) => setApiStatus(res.data.message))
      .catch(() => setApiStatus('❌ Could not connect to the backend. Is the server running?'));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '4rem' }}>
      <h1>🎨 AI Coloring Studio</h1>
      <p>Phase 1 — Setup Check</p>
      <hr />
      <p><strong>Backend API status:</strong></p>
      <p>{apiStatus}</p>
    </div>
  );
}

export default App;
