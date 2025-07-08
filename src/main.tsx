import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
<<<<<<< HEAD
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
=======
import Login from './Login';
import './index.css';

const isLoggedIn = !!localStorage.getItem('owl_logged_in');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isLoggedIn ? <App /> : <Login />}
>>>>>>> c2f6cf1 (Initial commit: OWL.tv branding, login page, and performance groundwork)
  </StrictMode>
);
