import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'react-quill/dist/quill.snow.css';
import './styles.css'; // Import existing styles after Quill CSS
import './styles/layout-animations.css'; // Import layout animations
import { AuthProvider } from './context/AuthContext';

// Create root container
const container = document.getElementById('root');
if (!container) {
  // If there's no root element, create one
  const rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
} else {
  // If root element exists, use it
  const root = ReactDOM.createRoot(container);
  root.render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}