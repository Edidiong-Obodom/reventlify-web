import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TanstackProvider from "./context/tanstack-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reventlify",
  description:
    "Reventlify is your ultimate all-in-one event ticketing platform. Create, manage, and sell tickets effortlessly with powerful features like affiliate programs, secure payments, ticket transfers, and personalized attendee experiences. Perfect for organizers, marketers, and event lovers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/img/Reventlify.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5850EC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Reventlify" />
        <link rel="apple-touch-icon" href="/img/Reventlify.png" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Reventlify" />
        <meta
          property="og:description"
          content="Reventlify is your ultimate all-in-one event ticketing platform. Create, manage, and sell tickets effortlessly with powerful features like affiliate programs, secure payments, ticket transfers, and personalized attendee experiences."
        />
        <meta
          property="og:image"
          content="https://reventlify.com/img/Reventlify.png"
        />
        <meta property="og:url" content="https://reventlify.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Reventlify" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Reventlify" />
        <meta
          name="twitter:description"
          content="Reventlify is your ultimate all-in-one event ticketing platform."
        />
        <meta
          name="twitter:image"
          content="https://reventlify.com/img/Reventlify.png"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TanstackProvider>{children}</TanstackProvider>
      </body>
    </html>
  );
}
