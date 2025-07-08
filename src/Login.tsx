import React, { useState } from 'react';
import './index.css';

const USERNAME = 'owl.tv13';
const PASSWORD = 'owltvpass';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === USERNAME && password === PASSWORD) {
      localStorage.setItem('owl_logged_in', 'true');
      window.location.reload();
    } else {
      setError('Usuário ou senha inválidos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <form onSubmit={handleSubmit} className="bg-black/80 p-8 rounded-xl shadow-lg max-w-sm w-full flex flex-col gap-6">
        <h1 className="text-3xl font-extrabold italic tracking-[0.35em] montserrat text-center mb-2">
          <span className="text-white">OWL</span><span className="text-primary">.tv</span>
        </h1>
        <h2 className="text-lg text-white text-center mb-4">Entrar na plataforma</h2>
        <input
          className="px-4 py-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
        />
        <input
          className="px-4 py-3 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-400 text-center text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 rounded bg-primary text-black font-bold text-lg hover:bg-yellow-400 transition"
        >Entrar</button>
      </form>
    </div>
  );
};

export default Login; 