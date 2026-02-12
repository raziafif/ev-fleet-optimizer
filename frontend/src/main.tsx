/**
 * Main Entry Point for React Application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Get root element and render the application
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Please ensure index.html has a div with id="root"');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
