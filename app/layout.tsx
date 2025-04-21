import './globals.css';
import type { Metadata } from 'next';
import { Ubuntu_Sans_Mono } from 'next/font/google';
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import {
  ClerkProvider,
} from '@clerk/nextjs';
import {dark} from '@clerk/themes';

const ubuntu = Ubuntu_Sans_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShortcutThing',
  description: 'Create and manage web shortcuts with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={ubuntu.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
