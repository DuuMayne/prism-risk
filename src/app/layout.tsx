import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "PRISM",
  description: "Predictive Risk Intelligence and Scoring Model",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
