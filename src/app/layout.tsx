import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-jakarta" 
});

const jetBrains = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono" 
});

export const metadata: Metadata = {
  title: "Sistema de Eventos & Registro",
  description: "Plataforma para gestión de eventos, registro anticipado, control de aforo y check-in en vivo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${plusJakarta.variable} ${jetBrains.variable} antialiased font-sans flex flex-col min-h-screen text-navy bg-cream`}>
        {children}
      </body>
    </html>
  );
}
