import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import './styles.css';

function App() {
    return (
        <HelmetProvider>
            <Router>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </Router>
        </HelmetProvider>
    );
}

export default App;