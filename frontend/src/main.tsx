import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Initialize theme BEFORE rendering React to prevent FOUC
(function initTheme() {
  try {
    // Global policy: keep UI in light mode for all roles.
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  } catch (e) {
    // Silently fail if localStorage not available
  }
})();

import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
