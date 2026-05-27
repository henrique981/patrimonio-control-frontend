import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Assuncao from './Assuncao';

const path = window.location.pathname;
const vtrMatch = path.match(/^\/vtr\/(.+)$/);

const root = ReactDOM.createRoot(document.getElementById('root'));

if (vtrMatch) {
  const prefixo = decodeURIComponent(vtrMatch[1]);
  root.render(<React.StrictMode><Assuncao prefixo={prefixo} /></React.StrictMode>);
} else {
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
