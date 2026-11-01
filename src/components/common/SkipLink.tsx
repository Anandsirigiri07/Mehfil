import React from 'react';

/**
 * Accessible skip link allowing keyboard users to bypass navigation.
 */
export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-3 focus:bg-mehfil-600 focus:text-white focus:font-semibold focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-mehfil-300"
    >
      Skip to main content
    </a>
  );
};
