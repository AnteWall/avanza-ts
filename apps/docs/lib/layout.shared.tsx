import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: 'Avanza Tools' },
    links: [
      { text: 'SDK', url: '/docs/sdk', active: 'nested-url' },
      { text: 'CLI', url: '/docs/cli', active: 'nested-url' },
    ],
  };
}
