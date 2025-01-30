import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import HeaderContainer from '@/app/components/global/header-container';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ToastProvider } from '@/app/components/elements/toast-container';

const interLight = Inter({
  subsets: ['latin'],
  weight: ['200'],
  display: 'swap',
});

export default async function RootLayout({
    children,
    pageProps
}: {
    children: React.ReactNode;
    pageProps: {
      session: any; // Replace 'any' with the actual type of the session data
    };
}) {

  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${interLight.className}`}>
        <ToastProvider>
          <HeaderContainer session={session} />
          <main className="p-8">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
