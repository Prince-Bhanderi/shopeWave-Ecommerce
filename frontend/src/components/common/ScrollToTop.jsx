import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls the viewport to the top on every route change (client-side
 * navigation does not do this automatically, unlike full page loads).
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window.HTMLElement.prototype ? 'instant' : 'auto' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
