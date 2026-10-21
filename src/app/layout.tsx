import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { assetPath } from '@/lib/assetPath';

export const metadata: Metadata = {
  title: 'Novora — AI Voice Agent Evaluation Infrastructure',
  description: 'Deterministic evaluation, regression monitoring, and policy compliance for conversational AI voice agents.',
  icons: {
    icon: assetPath('/novora-logo-light.png'),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* Inter font — loaded via link to avoid CSS @import ordering conflicts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
