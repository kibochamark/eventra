import type { Metadata } from "next";
import { Figtree, EB_Garamond } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "600", "700"],
  display: "swap",
});

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
  style: ["normal"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aura Events",
  description: "Premium event rental management platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${figtree.variable}`}>
      <body className="antialiased font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
