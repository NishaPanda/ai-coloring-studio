import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Browse from '../pages/Browse';

const renderBrowse = () => {
  return render(
    <MemoryRouter>
      <Browse />
    </MemoryRouter>
  );
};

describe('Browse Page Filter & Search Tests', () => {

  it('renders all 4 sample coloring pages initially', () => {
    renderBrowse();

    expect(screen.getByText('Sitting Cat')).toBeInTheDocument();
    expect(screen.getByText('Garden Flower')).toBeInTheDocument();
    expect(screen.getByText('Space Rocket')).toBeInTheDocument();
    expect(screen.getByText('Friendly Dragon')).toBeInTheDocument();
    expect(screen.getByText(/4 pages found/i)).toBeInTheDocument();
  });

  it('filters by category when clicking category filter pills', () => {
    renderBrowse();

    // Click Animals category button
    const animalsBtn = screen.getByRole('button', { name: /^animals$/i });
    fireEvent.click(animalsBtn);

    expect(screen.getByText('Sitting Cat')).toBeInTheDocument();
    expect(screen.queryByText('Garden Flower')).not.toBeInTheDocument();
    expect(screen.queryByText('Space Rocket')).not.toBeInTheDocument();
    expect(screen.queryByText('Friendly Dragon')).not.toBeInTheDocument();
    expect(screen.getByText(/1 page found/i)).toBeInTheDocument();
  });

  it('filters by difficulty when clicking difficulty filter pills', () => {
    renderBrowse();

    // Click Hard difficulty button
    const hardBtn = screen.getByRole('button', { name: /^hard$/i });
    fireEvent.click(hardBtn);

    expect(screen.getByText('Friendly Dragon')).toBeInTheDocument();
    expect(screen.queryByText('Sitting Cat')).not.toBeInTheDocument();
    expect(screen.queryByText('Garden Flower')).not.toBeInTheDocument();
    expect(screen.queryByText('Space Rocket')).not.toBeInTheDocument();
  });

  it('filters pages dynamically using search query', () => {
    renderBrowse();

    const searchInput = screen.getByLabelText(/search coloring pages/i);
    fireEvent.change(searchInput, { target: { value: 'rocket' } });

    expect(screen.getByText('Space Rocket')).toBeInTheDocument();
    expect(screen.queryByText('Sitting Cat')).not.toBeInTheDocument();
    expect(screen.queryByText('Garden Flower')).not.toBeInTheDocument();
    expect(screen.getByText(/1 page found/i)).toBeInTheDocument();
  });

  it('displays empty state when no pages match, and resets via "Clear all filters"', () => {
    renderBrowse();

    const searchInput = screen.getByLabelText(/search coloring pages/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistentquery12345' } });

    expect(screen.getByText(/no coloring pages match your filters/i)).toBeInTheDocument();
    expect(screen.queryByText('Sitting Cat')).not.toBeInTheDocument();

    // Click "Clear all filters" button
    const clearBtn = screen.getByRole('button', { name: /clear all filters/i });
    fireEvent.click(clearBtn);

    // Verify all pages are restored
    expect(screen.getByText('Sitting Cat')).toBeInTheDocument();
    expect(screen.getByText('Garden Flower')).toBeInTheDocument();
    expect(screen.getByText('Space Rocket')).toBeInTheDocument();
    expect(screen.getByText('Friendly Dragon')).toBeInTheDocument();
    expect(screen.getByText(/4 pages found/i)).toBeInTheDocument();
  });

});
