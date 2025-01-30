import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import Header from '@/app/components/global/header';
import { ToastProvider } from '@/app/components/elements/toast-container';

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
        <ToastProvider>
          <Header />
          <main className="p-8">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
