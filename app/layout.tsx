import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quizzer AI",
  description: "Generate quizzes with Groq and track your scores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full antialiased">
        <body className="min-h-full bg-slate-950 text-slate-100">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
