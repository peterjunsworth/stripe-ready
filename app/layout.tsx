import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import Header from '@/app/components/global/header';

const interLight = Inter({
  subsets: ['latin'],
  weight: ['200'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${interLight.className}`}>
        <Header />
        <main className="p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
