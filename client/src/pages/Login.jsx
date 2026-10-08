import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      // Update global auth state and localStorage
      loginUser(response.data.user, response.data.token);
      // Redirect to home
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Login</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Welcome back to AI Coloring Studio.</p>
      
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          style={{ padding: '0.8rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/register" style={{ color: '#007bff' }}>Don't have an account? Register</Link>
      </div>
    </div>
  );
};

export default Login;
