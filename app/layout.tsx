import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NODO CRM",
  description: "AI Agents Studio — CRM interno",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  );
}
