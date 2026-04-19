// global.d.ts
import 'react';

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}

declare global {
  interface Window {
    // Replaced 'any[]' with 'unknown[]' to satisfy ESLint
    dataLayer: unknown[];

    // Specifically typing the gtag commands for better developer experience
    gtag: (
      command: 'consent' | 'config' | 'js' | 'event' | 'set',
      ...args: unknown[]
    ) => void;
  }
}

export {};