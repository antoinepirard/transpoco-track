/**
 * Theme switcher utility that prevents transition animations during theme changes
 * Following web interface guidelines from rauno.me
 */

export function disableTransitionsTemporarily() {
  const css = document.createElement('style');
  css.type = 'text/css';
  css.appendChild(
    document.createTextNode(
      `* {
         transition-duration: 0s !important;
         transition-delay: 0s !important;
         animation-duration: 0s !important;
         animation-delay: 0s !important;
      }`
    )
  );
  document.head.appendChild(css);

  // Force a repaint
  void window.getComputedStyle(css).opacity;

  return () => {
    document.head.removeChild(css);
  };
}

export function switchTheme(theme: 'light' | 'dark' | 'system') {
  const restoreTransitions = disableTransitionsTemporarily();
  
  // Apply theme changes
  if (theme === 'system') {
    localStorage.removeItem('theme');
    document.documentElement.classList.remove('light', 'dark');
  } else {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }

  // Restore transitions after a brief delay
  setTimeout(restoreTransitions, 100);
}

// Optimized intersection observer for performance
export function createOptimizedIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// Performance helper for will-change optimization
export function optimizeScrollAnimation(element: HTMLElement) {
  let isScrolling = false;
  let scrollTimeout: NodeJS.Timeout;

  const handleScrollStart = () => {
    if (!isScrolling) {
      element.style.willChange = 'transform';
      isScrolling = true;
    }
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      element.style.willChange = 'auto';
      isScrolling = false;
    }, 100);
  };

  element.addEventListener('scroll', handleScrollStart, { passive: true });

  return () => {
    element.removeEventListener('scroll', handleScrollStart);
    element.style.willChange = 'auto';
    clearTimeout(scrollTimeout);
  };
}

