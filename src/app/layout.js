import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'LigeirinhoResolve - Atendimento',
  description: 'Sistema de Help Desk',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <link rel="stylesheet" href="/css/style.css" />
      </head>
      <body>
        {children}
        
        {/* External Libraries */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js" strategy="beforeInteractive" />
        
        {/* App Logic */}
        <Script src="/js/app.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
