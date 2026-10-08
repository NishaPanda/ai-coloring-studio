import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1>Welcome to AI Coloring Studio 🎨</h1>
      <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '600px', margin: '1rem auto 2rem' }}>
        Discover beautiful coloring pages, color them digitally, and get AI-powered palette suggestions to bring your art to life.
      </p>
      <Link 
        to="/browse" 
        style={{ 
          padding: '1rem 2rem', 
          backgroundColor: '#007bff', 
          color: 'white', 
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}
      >
        Start Coloring
      </Link>
    </div>
  );
};

export default Home;
