import api from './api';

/**
 * artworkService.js
 * Centralized API service for saving, loading, updating, and deleting artworks.
 * Uses the pre-configured Axios instance in api.js which automatically includes
 * the JWT token in Authorization header.
 */

// Create a new artwork
export const createArtwork = async ({ pageId, pageTitle, title, regionColors }) => {
  const response = await api.post('/artworks', {
    pageId,
    pageTitle,
    title,
    regionColors,
  });
  return response.data;
};

// Update an existing artwork
export const updateArtwork = async (id, { title, regionColors }) => {
  const response = await api.put(`/artworks/${id}`, {
    title,
    regionColors,
  });
  return response.data;
};

// Get all artworks for the logged-in user
export const getMyArtworks = async () => {
  const response = await api.get('/artworks');
  return response.data;
};

// Get a single artwork by ID
export const getArtworkById = async (id) => {
  const response = await api.get(`/artworks/${id}`);
  return response.data;
};

// Delete an artwork by ID
export const deleteArtwork = async (id) => {
  const response = await api.delete(`/artworks/${id}`);
  return response.data;
};
