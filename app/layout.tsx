import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ANSTAT AI ENGINE — AI-Native Software Delivery Platform',
  description: 'Operating layer for software studios and development agencies. Proposal generation, code engine, security scanner, AI debugging, and job orchestration.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
