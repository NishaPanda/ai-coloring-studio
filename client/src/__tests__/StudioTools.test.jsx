import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Studio from '../pages/Studio';

const renderStudio = (initialRoute = '/studio/cat', mockUser = null) => {
  return render(
    <AuthContext.Provider value={{ user: mockUser, loginUser: () => {}, logoutUser: () => {} }}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/studio/:id" element={<Studio />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Studio Coloring Tools & History Tests', () => {

  it('renders Studio with selected page details and default tools', () => {
    renderStudio('/studio/cat');

    expect(screen.getByRole('heading', { level: 1, name: 'Sitting Cat' })).toBeInTheDocument();
    expect(screen.getByText('Animals')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fill/i })).toHaveClass('tool-btn--active');
  });

  it('updates selected paint color when color input changes', () => {
    renderStudio('/studio/cat');

    const colorInput = screen.getByLabelText(/color picker/i);
    fireEvent.change(colorInput, { target: { value: '#2a9d8f' } });

    expect(screen.getByText('#2A9D8F')).toBeInTheDocument();
    expect(screen.getByLabelText(/current color swatch/i)).toHaveStyle({
      backgroundColor: '#2a9d8f',
    });
  });

  it('toggles between Fill and Eraser tools', () => {
    renderStudio('/studio/cat');

    const fillBtn = screen.getByRole('button', { name: /fill/i });
    const eraserBtn = screen.getByRole('button', { name: /eraser/i });

    expect(fillBtn).toHaveAttribute('aria-pressed', 'true');
    expect(eraserBtn).toHaveAttribute('aria-pressed', 'false');

    // Switch to Eraser
    fireEvent.click(eraserBtn);
    expect(eraserBtn).toHaveAttribute('aria-pressed', 'true');
    expect(eraserBtn).toHaveClass('tool-btn--eraser-active');
    expect(fillBtn).toHaveAttribute('aria-pressed', 'false');

    // Switch back to Fill
    fireEvent.click(fillBtn);
    expect(fillBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('colors an SVG region on click and enables Undo/Redo correctly', () => {
    renderStudio('/studio/cat');

    const undoBtn = screen.getByRole('button', { name: /^undo/i });
    const redoBtn = screen.getByRole('button', { name: /^redo/i });

    // Initially undo and redo are disabled
    expect(undoBtn).toBeDisabled();
    expect(redoBtn).toBeDisabled();

    // Find and click the cat tail region
    const tailRegion = screen.getByLabelText(/color tail region/i);
    fireEvent.click(tailRegion);

    // After coloring, region fill is updated and Undo is enabled
    expect(tailRegion).toHaveStyle({ fill: '#ff6b6b' });
    expect(undoBtn).not.toBeDisabled();
    expect(redoBtn).toBeDisabled();

    // Click Undo
    fireEvent.click(undoBtn);
    expect(tailRegion).toHaveStyle({ fill: '#ffffff' });
    expect(undoBtn).toBeDisabled();
    expect(redoBtn).not.toBeDisabled();

    // Click Redo
    fireEvent.click(redoBtn);
    expect(tailRegion).toHaveStyle({ fill: '#ff6b6b' });
    expect(undoBtn).not.toBeDisabled();
    expect(redoBtn).toBeDisabled();
  });

  it('resets all coloring regions and history when clicking "Reset all"', () => {
    renderStudio('/studio/cat');

    const tailRegion = screen.getByLabelText(/color tail region/i);
    const bodyRegion = screen.getByLabelText(/color body region/i);
    const undoBtn = screen.getByRole('button', { name: /^undo/i });
    const resetBtn = screen.getByRole('button', { name: /reset all/i });

    // Color two regions
    fireEvent.click(tailRegion);
    fireEvent.click(bodyRegion);

    expect(tailRegion).toHaveStyle({ fill: '#ff6b6b' });
    expect(bodyRegion).toHaveStyle({ fill: '#ff6b6b' });
    expect(undoBtn).not.toBeDisabled();

    // Click Reset all
    fireEvent.click(resetBtn);

    // Regions are restored to white and history is cleared
    expect(tailRegion).toHaveStyle({ fill: '#ffffff' });
    expect(bodyRegion).toHaveStyle({ fill: '#ffffff' });
    expect(undoBtn).toBeDisabled();
  });

});
