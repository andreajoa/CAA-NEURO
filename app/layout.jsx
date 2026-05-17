import "./globals.css";

export const metadata = {
  title: "CAA Neuro",
  description: "Prancha CAA personalizada com voz em português brasileiro",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
