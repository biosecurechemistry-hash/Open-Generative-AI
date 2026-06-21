import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Organic Dawn — Island Dashboard',
  description: 'Local post-production interface — zero cloud dependencies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-surface-950 text-surface-100 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
