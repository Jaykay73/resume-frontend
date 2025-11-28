import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- THIS IS THE KEY LINE

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resume Optimizer",
  description: "AI Powered Resume Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}