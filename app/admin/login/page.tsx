
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        setError('Senha incorreta ou acesso indisponível.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap section">
      <section className="order" style={{ maxWidth: 440, margin: '40px auto' }}>
        <h1>ENTRE ALMAS</h1>
        <h2>Acesso administrativo</h2>
        <p>Entre com sua senha para gerenciar o site.</p>

        <form onSubmit={login}>
          <label>
            Senha administrativa
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p role="alert">{error}</p>}

          <button className="button primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>
      </section>
    </main>
  );
}
