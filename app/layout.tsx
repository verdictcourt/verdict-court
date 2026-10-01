import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verdict Court — Make Your Case. Face the Verdict.",
  description: "Structured community deliberation and entertainment from The Russell Madison Group.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
