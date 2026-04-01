import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PayNest Control Center',
  description: 'Payment orchestration, reliability telemetry, and operator confidence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
