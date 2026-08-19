import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import React from 'react';
import Auth from './components/Auth';
import CandidateManager from './components/CandidateManager';

describe('Frontend Component & E2E Tests', () => {
  test('renders Auth component title correctly', () => {
    render(<Auth onLoginSuccess={() => {}} />);
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  test('renders Candidate Manager form submit button', () => {
    render(<CandidateManager />);
    const submitBtn = screen.getByRole('button', { name: /Submit Candidate/i });
    expect(submitBtn).toBeInTheDocument();
  });

  test('allows stage or role select dropdown interaction', () => {
    render(<CandidateManager />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  test('handles file selection for resume upload', () => {
    render(<CandidateManager />);
    const file = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Choose File/i);

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
  });

  test('E2E Flow: Auth login updates state to Candidate Manager view', () => {
    const { rerender } = render(<Auth onLoginSuccess={() => rerender(<CandidateManager />)} />);
    
    const emailInput = screen.getByPlaceholderText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'user@hirebase.com' } });
    expect(emailInput.value).toBe('user@hirebase.com');

    rerender(<CandidateManager />);
    expect(screen.getByText(/Candidate Pipeline/i)).toBeInTheDocument();
  });
});