/**
 * Theme initialization — runs BEFORE React mounts to prevent FOUC (Flash Of Unstyled Content)
 * This must be loaded as early as possible in index.html
 */

function initializeTheme() {
  try {
    document.documentElement.classList.remove('dark');
  } catch (e) {
    // Silently fail if localStorage is not available
  }
}

// Run immediately
initializeTheme();
