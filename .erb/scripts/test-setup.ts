import '@testing-library/jest-dom';
import { enableFetchMocks } from 'jest-fetch-mock';

Object.defineProperty(global.window, 'electron', {
  value: {
    baseAPIURL: 'http://localhost:8001/api',
  },
  writable: true,
});

enableFetchMocks();
