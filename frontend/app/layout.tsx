import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../style/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ApiHealthGate } from "@/components/layout/ApiHealthGate";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Submit Koro",
  description: "A project submission and review dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ApiHealthGate>
          {children}
          <Toaster />
        </ApiHealthGate>
      </body>
    </html>
  );
}
