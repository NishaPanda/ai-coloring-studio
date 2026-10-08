const Login = () => {
  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Login</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Authentication will be added in Phase 3.</p>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="email" placeholder="Email" style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="password" placeholder="Password" style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <button type="button" style={{ padding: '0.8rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Login (Coming Soon)
        </button>
      </form>
    </div>
  );
};

export default Login;
