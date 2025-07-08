import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Login from './Login';
import './index.css';

const isLoggedIn = !!localStorage.getItem('owl_logged_in');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isLoggedIn ? <App /> : <Login />}
  </StrictMode>
);
