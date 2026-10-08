import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Create Account</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Registration will be added in Phase 3.</p>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="text" placeholder="Username" style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="email" placeholder="Email" style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="password" placeholder="Password" style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <button type="button" style={{ padding: '0.8rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Register (Coming Soon)
        </button>
      </form>
      
      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/login" style={{ color: '#007bff' }}>Already have an account? Login here.</Link>
      </div>
    </div>
  );
};

export default Register;
