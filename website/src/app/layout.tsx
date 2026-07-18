import React from 'react';

export const metadata = {
  title: 'IIT Calendar',
  description: 'IIT Calendar Landing Page & API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
