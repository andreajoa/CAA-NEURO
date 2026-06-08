import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import "./globals.css";
import ErrorTracker from "./providers/ErrorTracker";
import PwaUpdateBanner from "./components/PwaUpdateBanner";

export const metadata = {
  title: "CAA Neuro",
  description: "Comunicação que transforma vidas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CAA Neuro",
  },
};

export const viewport = {
  themeColor: "#C76B4A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icon-180-v2.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icon-180-v2.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icon-167-v2.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icon-152-v2.png" />
          <link rel="apple-touch-icon" sizes="120x120" href="/icon-120-v2.png" />
          <link rel="apple-touch-icon" sizes="76x76"   href="/icon-76-v2.png" />
          <link rel="apple-touch-icon" sizes="57x57"   href="/icon-57-v2.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="CAA Neuro" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#C76B4A" />
        </head>
        <body>
          <ErrorTracker />
          <PwaUpdateBanner />
          <ServiceWorkerRegister />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

function ServiceWorkerRegister() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) { console.log('SW registrado:', reg.scope); })
                .catch(function(err) { console.log('SW erro:', err); });
            });
          }
        `,
      }}
    />
  );
}

