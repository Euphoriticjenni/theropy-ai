import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TheroPy AI — Your Therapeutic Companion",
  description: "An AI-powered therapeutic chatbot providing emotional support, personalized responses, and conversation memory in a safe, private environment.",
  keywords: ["therapy", "AI chatbot", "mental health", "emotional support", "wellness"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
