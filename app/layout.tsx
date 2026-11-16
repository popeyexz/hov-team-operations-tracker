import type { Metadata } from 'next';
import './globals.css';
import { ActiveProfileProvider } from '@/context/ActiveProfileContext';
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
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#06080e] text-slate-100 antialiased selection:bg-indigo-600 selection:text-white relative">
        {/* Ambient Aurora Glow Lights (Fixed, pointer-events-none) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
          <div className="absolute -top-[25%] -left-[10%] w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] rounded-full bg-indigo-600/[0.09] blur-[140px]" />
          <div className="absolute top-[35%] -right-[15%] w-[50vw] h-[50vw] max-w-[750px] max-h-[750px] rounded-full bg-violet-600/[0.08] blur-[160px]" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] rounded-full bg-emerald-600/[0.05] blur-[170px]" />
        </div>

        <ActiveProfileProvider>
          <Navbar />
          <main className="flex-1 pb-16">{children}</main>
        </ActiveProfileProvider>

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
