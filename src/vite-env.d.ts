/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*?raw' {
  const content: string;
  export default content;
}

import 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    script?: string;
  }
}
