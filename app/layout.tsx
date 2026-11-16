import type { Metadata } from 'next';
import './globals.css';
import { ActiveProfileProvider } from '@/context/ActiveProfileContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'HOV Team Operations & OKR Tracker',
  description: 'Team operations, OKR tracking and 13-venture management for House of Ventures',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('hov_theme') || 'dark';
                document.documentElement.classList.remove('dark', 'light');
                document.documentElement.classList.add(t);
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased relative transition-colors duration-200">
        <ThemeProvider>
          <ActiveProfileProvider>
            <Navbar />
            <main className="flex-1 pb-28 md:pb-16">{children}</main>
          </ActiveProfileProvider>
        </ThemeProvider>

        {/* Register Service Worker for Web Push */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('[SW] Registered with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('[SW] Registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
