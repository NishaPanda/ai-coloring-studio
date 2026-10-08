import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      // On success, redirect to login page
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Create Account</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Join AI Coloring Studio today.</p>
      
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="text" 
          name="username"
          placeholder="Username" 
          value={formData.username}
          onChange={handleChange}
          required
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} 
        />
        <input 
          type="email" 
          name="email"
          placeholder="Email" 
          value={formData.email}
          onChange={handleChange}
          required
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} 
        />
        <input 
          type="password" 
          name="password"
          placeholder="Password" 
          value={formData.password}
          onChange={handleChange}
          required
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} 
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '0.8rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/login" style={{ color: '#007bff' }}>Already have an account? Login</Link>
      </div>
    </div>
  );
};

export default Register;
