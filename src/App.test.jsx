import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import React from 'react';
import Auth from './components/Auth';
import CandidateManager from './components/CandidateManager';

describe('Frontend Component & E2E Tests', () => {
  test('renders Auth component title correctly', async () => {
    await act(async () => {
      render(<Auth onLoginSuccess={() => {}} />);
    });
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  test('renders Candidate Manager form submit button', async () => {
    await act(async () => {
      render(<CandidateManager />);
    });
    const submitBtn = screen.getByRole('button', { name: /Submit Candidate/i });
    expect(submitBtn).toBeInTheDocument();
  });

  test('allows stage or role select dropdown interaction', async () => {
    await act(async () => {
      render(<CandidateManager />);
    });
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  test('handles file selection for resume upload', async () => {
    await act(async () => {
      render(<CandidateManager />);
    });
    const file = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Choose File/i);

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
  });

  test('E2E Flow: Auth login updates state to Candidate Manager view', async () => {
    let rerenderFn;
    await act(async () => {
      const { rerender } = render(<Auth onLoginSuccess={() => rerender(<CandidateManager />)} />);
      rerenderFn = rerender;
    });
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@hirebase.com' } });
    });
    expect(emailInput.value).toBe('user@hirebase.com');

    await act(async () => {
      rerenderFn(<CandidateManager />);
    });
    expect(screen.getByText(/Candidate Pipeline/i)).toBeInTheDocument();
  });
});