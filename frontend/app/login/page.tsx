'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      localStorage.setItem('fatima_token', data.access_token);
      localStorage.setItem('fatima_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-fatima-ivory px-4">
      <div className="w-full max-w-sm bg-white border border-fatima-sand rounded-2xl shadow-lg p-8">
        <h1 className="text-xl text-center text-fatima-bronze tracking-wide mb-1">
          CENTRE PASTORAL NOTRE DAME DE FATIMA
        </h1>
        <p className="text-center text-sm text-fatima-ink/70 mb-6">Hospitality Management System</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border border-fatima-sand rounded-lg px-3 py-2 bg-fatima-ivory focus:outline-none focus:ring-2 focus:ring-fatima-gold"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full border border-fatima-sand rounded-lg px-3 py-2 bg-fatima-ivory focus:outline-none focus:ring-2 focus:ring-fatima-gold"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="w-full bg-fatima-gold text-white rounded-lg py-2 font-medium hover:bg-fatima-bronze transition">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
