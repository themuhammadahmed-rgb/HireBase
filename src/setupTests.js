import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch to prevent network connection errors during test runs
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);