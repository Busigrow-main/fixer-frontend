import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { BookingProvider } from "@/app/context/BookingContext";
import { AuthProvider } from "@/app/context/AuthContext";
import BookingModal from "@/app/components/BookingModal";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fixxer | Professional Appliance Repair & Parts",
  description:
    "Certified technicians at your door in 30 minutes. Guaranteed OEM parts for all major luxury brands. Local, licensed, and background-checked.",
  keywords: ["appliance repair", "OEM parts", "local technician", "refrigerator repair", "HVAC"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} scroll-smooth`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <BookingProvider>
            {children}
            <BookingModal />
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
