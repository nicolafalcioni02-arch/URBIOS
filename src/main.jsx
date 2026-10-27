import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Importiamo Tailwind e stili custom
import './looks/vetro.css'; // aspetto "Vetro": attivo solo con <html data-look="vetro">
import './looks/vetro-liquid.css'; // controlli Liquid Glass dell'aspetto "Vetro"

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
