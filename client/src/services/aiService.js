import api from './api';

/**
 * aiService.js – Phase 7: AI Color Suggestions
 *
 * Calls the backend /api/ai/suggest-colors endpoint with the page's metadata.
 */
export const suggestColors = async ({ pageId, title, category, description }) => {
  const response = await api.post('/ai/suggest-colors', {
    pageId,
    title,
    category,
    description,
  });
  return response.data;
};
