import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './pages/App.tsx';
import './index.css';
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = '640451570224-5k4jfuis0f04tbfgnvgo244h7jefjvng.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
  <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
