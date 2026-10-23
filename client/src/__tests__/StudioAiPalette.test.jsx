import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Studio from '../pages/Studio';
import * as aiService from '../services/aiService';

// Mock the aiService
vi.mock('../services/aiService', () => ({
  suggestColors: vi.fn(),
}));

const renderStudio = (initialRoute = '/studio/flower') => {
  return render(
    <AuthContext.Provider value={{ user: null, loginUser: () => {}, logoutUser: () => {} }}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/studio/:id" element={<Studio />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Studio AI Palette Suggestions & Swatches Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial empty prompt with "Suggest Colors" button', () => {
    renderStudio('/studio/flower');

    expect(screen.getByText('✨ AI Palette')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /suggest colors/i })).toBeInTheDocument();
    expect(screen.getByText(/need inspiration\? get a coordinated palette/i)).toBeInTheDocument();
  });

  it('triggers AI suggestion API and displays returned color swatches', async () => {
    aiService.suggestColors.mockResolvedValueOnce({
      success: true,
      isFallback: false,
      palette: {
        paletteName: 'Floral Harmony',
        themeDescription: 'Soft garden tones.',
        colors: [
          { hex: '#e63946', name: 'Ruby Petal', role: 'Main petals' },
          { hex: '#ffb703', name: 'Golden Sun', role: 'Core pistil' },
          { hex: '#2b9348', name: 'Lush Leaf', role: 'Leaves' },
        ],
      },
    });

    renderStudio('/studio/flower');

    const suggestBtn = screen.getByRole('button', { name: /suggest colors/i });
    fireEvent.click(suggestBtn);

    // Verify loading state is shown initially
    expect(screen.getByText(/generating palette\.\.\./i)).toBeInTheDocument();

    // Wait for swatches to appear
    await waitFor(() => {
      expect(screen.getByText('Floral Harmony')).toBeInTheDocument();
    });

    expect(screen.getByText('Soft garden tones.')).toBeInTheDocument();

    // Verify 3 swatches are rendered with their roles
    const swatches = screen.getAllByRole('button', { name: /^select /i });
    expect(swatches.length).toBe(3);
    expect(screen.getByLabelText(/select ruby petal/i)).toHaveStyle({ backgroundColor: '#e63946' });
  });

  it('clicking a suggested swatch updates selectedColor without filling SVG regions', async () => {
    aiService.suggestColors.mockResolvedValueOnce({
      success: true,
      isFallback: false,
      palette: {
        paletteName: 'Floral Harmony',
        themeDescription: 'Soft garden tones.',
        colors: [
          { hex: '#2b9348', name: 'Lush Leaf', role: 'Leaves' },
        ],
      },
    });

    renderStudio('/studio/flower');

    // Click Suggest Colors
    fireEvent.click(screen.getByRole('button', { name: /suggest colors/i }));

    await waitFor(() => {
      expect(screen.getByText('Floral Harmony')).toBeInTheDocument();
    });

    const leafSwatch = screen.getByLabelText(/select lush leaf/i);

    // Initial region fill on canvas is blank (#ffffff)
    const petalRegion = screen.getByLabelText(/color petal 1 region/i);
    expect(petalRegion).toHaveStyle({ fill: '#ffffff' });

    // Click the suggested swatch
    fireEvent.click(leafSwatch);

    // Verify the active color in the Studio updated to #2b9348
    expect(screen.getByText('#2B9348')).toBeInTheDocument();

    // CRITICAL: Verify the canvas region was NOT automatically colored by clicking the swatch
    expect(petalRegion).toHaveStyle({ fill: '#ffffff' });

    // Now clicking the petal region should color it with the selected swatch color
    fireEvent.click(petalRegion);
    expect(petalRegion).toHaveStyle({ fill: '#2b9348' });
  });

  it('renders error state with retry button when AI service fails', async () => {
    aiService.suggestColors.mockRejectedValueOnce({
      response: { data: { message: 'AI service temporarily unavailable' } },
    });

    renderStudio('/studio/flower');

    fireEvent.click(screen.getByRole('button', { name: /suggest colors/i }));

    await waitFor(() => {
      expect(screen.getByText(/ai service temporarily unavailable/i)).toBeInTheDocument();
    });

    // Check that Retry button is rendered
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Now mock a successful retry
    aiService.suggestColors.mockResolvedValueOnce({
      success: true,
      isFallback: true,
      message: 'Displaying curated fallback palette.',
      palette: {
        paletteName: 'Curated Bloom',
        colors: [{ hex: '#e63946', name: 'Curated Red' }],
      },
    });

    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Curated Bloom')).toBeInTheDocument();
      expect(screen.getByText(/displaying curated fallback palette/i)).toBeInTheDocument();
    });
  });

});
