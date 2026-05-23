import type { Metadata } from "next";
import { Montserrat, Lato } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { rootMetadata } from "@/lib/site/metadata";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${lato.variable} font-body antialiased flex flex-col min-h-screen`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
