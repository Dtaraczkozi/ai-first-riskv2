import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Risk Agent",
  description: "AI-first risk management prototype",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="app-body-font">{children}</body>
    </html>
  );
}
