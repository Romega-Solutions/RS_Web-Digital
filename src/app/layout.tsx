import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Romega Solutions",
  description: "Built for growing businesses. Designed for what is next.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
