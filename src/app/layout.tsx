import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { LayoutClientWrapper } from '@/components/layout/layout-client-wrapper';

export const metadata: Metadata = {
  title: 'Chez Shiobara B&B',
  description: 'A charming bed and breakfast in Shiobara.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased flex flex-col")}>
        <LayoutClientWrapper>
          <div className="flex-grow flex flex-col">
            {children}
          </div>
          <Toaster />
        </LayoutClientWrapper>
      </body>
    </html>
  );
}
