import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Search } from '@/components/search';

import './global.css';

export const metadata: Metadata = {
  title: { default: 'Avanza Tools', template: '%s | Avanza Tools' },
  description: 'Documentation for the avanza-ts SDK and avanza-cli.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ SearchDialog: Search }}>{children}</RootProvider>
      </body>
    </html>
  );
}
