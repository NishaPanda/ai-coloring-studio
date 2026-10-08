import PageCard from '../components/PageCard';

const Browse = () => {
  // Dummy data for Phase 2 UI structure
  const dummyPages = [
    { id: '1', title: 'Cute Panda', category: 'Animals' },
    { id: '2', title: 'Mystic Forest', category: 'Nature' },
    { id: '3', title: 'Space Explorer', category: 'Space' },
    { id: '4', title: 'Dragon Castle', category: 'Fantasy' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Browse Coloring Pages</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Select a page to start coloring.</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '2rem' 
      }}>
        {dummyPages.map(page => (
          <PageCard 
            key={page.id}
            id={page.id}
            title={page.title}
            category={page.category}
          />
        ))}
      </div>
    </div>
  );
};

export default Browse;
