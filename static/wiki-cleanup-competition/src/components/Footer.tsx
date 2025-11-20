import React from 'react';

export const Footer: React.FC = () => {
  const appVersion = process.env.REACT_APP_VERSION;

  return (
    <footer className="mt-12 py-6 text-center text-gray-500 text-sm border-t border-nr-dark-light">
      <p className="italic mb-4">
        <sup>*</sup>Prizes are regionally adjusted for equivalent value.
      </p>
      <p>
        &copy; 2025 | Made with <span role="img" aria-label="love" className="text-red-500">❤️</span> by{' '}
        <a
          href="https://github.com/keegoid-nr/wiki-cleanup-competition"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-nr-green-accent underline"
        >
          Keegan Mullaney
        </a>
        , a Principal Technical Support Engineer at New Relic, with help from{' '}
        <a
          href="https://aistudio.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-nr-green-accent underline"
        >
          Google's AI Studio
        </a>.
      </p>
      {appVersion && (
        <p className="mt-2 text-xs text-gray-600">
          v{appVersion}
        </p>
      )}
    </footer>
  );
};
