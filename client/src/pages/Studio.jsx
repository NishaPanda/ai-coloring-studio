const Studio = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Coloring Studio</h2>
      <p style={{ color: '#666', marginTop: '1rem' }}>
        The interactive coloring canvas will be implemented here in Phase 4.
      </p>
      <div style={{
        marginTop: '2rem',
        height: '400px',
        backgroundColor: '#e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #ccc',
        borderRadius: '8px'
      }}>
        <span style={{ color: '#aaa', fontSize: '1.2rem' }}>Canvas Placeholder</span>
      </div>
    </div>
  );
};

export default Studio;
