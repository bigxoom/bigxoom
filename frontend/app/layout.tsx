import './globals.css';

export const metadata = {
  title: 'CENTRE PASTORAL NOTRE DAME DE FATIMA — Hospitality Management System',
  description: 'Hospitality • Service • Accountability • Excellence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans bg-fatima-ivory text-fatima-ink antialiased">{children}</body>
    </html>
  );
}
