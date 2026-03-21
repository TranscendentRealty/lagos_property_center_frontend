'use client';

import { useEffect } from 'react';

const ScrollToTop = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return null;
};

export default ScrollToTop;
