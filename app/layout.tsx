import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-first risk",
  description: "Risk agent prototype",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
