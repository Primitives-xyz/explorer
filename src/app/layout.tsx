import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Graph Explorer',
  description: 'Explore social connections on Tapestry Protocol',
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
