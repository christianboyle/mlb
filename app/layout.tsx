import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'MLB Scores & Schedules',
    template: '%s | MLB Scores & Schedules',
  },
  description: 'MLB scores and schedules, featuring the Kansas City Royals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="flex flex-col min-h-screen text-black dark:text-white bg-white dark:bg-black">
        <div className="flex-grow overflow-y-scroll h-[calc(100vh_-_48px)] border-b border-gray-200 dark:border-gray-800">
          {children}
        </div>
        <footer className="text-gray-600 dark:text-gray-400 text-xs mx-auto text-center pt-4 h-[48px]">
          {'Built using the '}
          <a
            href="https://statsapi.mlb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 dark:hover:text-gray-100"
          >
            MLB API
          </a>
        </footer>
      </body>
    </html>
  );
}
