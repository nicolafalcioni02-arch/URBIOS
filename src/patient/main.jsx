import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './patient.css';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// Shell in cache per usare l'app senza rete (solo nella versione pubblicata).
if (import.meta.env.PROD && 'serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
