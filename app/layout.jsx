import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import ErrorTracker from "./providers/ErrorTracker";

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
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icon-192.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="CAA Neuro" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#00885f" />
        </head>
        <body>
          <ErrorTracker />
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
