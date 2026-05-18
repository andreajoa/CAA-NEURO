import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import ErrorTracker from "./providers/ErrorTracker";

export const metadata = {
  title: "CAA Neuro",
  description: "Comunicação que transforma vidas.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body><ErrorTracker />{children}</body>
      </html>
    </ClerkProvider>
  );
}
