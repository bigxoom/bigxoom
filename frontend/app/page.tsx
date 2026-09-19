'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('fatima_token');
    router.replace(token ? '/dashboard' : '/login');
  }, [router]);
  return (
    <div className="flex items-center justify-center h-screen text-fatima-bronze">
      Loading CENTRE PASTORAL NOTRE DAME DE FATIMA...
    </div>
  );
}
