import React from 'react';
import ReactDOM from 'react-dom/client';

// 1. GLOBAL OVERRIDE MUST BE FIRST
import './styles/global.css';

// 2. OTHER IMPORTS SECOND
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);