import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CMPS 207 - Assignment 2",
  description: "Assignment 2 Next App",
};

export function Heading() {
  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-1">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-white text-xl font-bold">
            Assignment 2
          </Link>
          <div className="space-x-6">
            <Link
              href="/"
              className="text-white dark:text-gray-400 hover:text-blue-200 transition-colors"
            >
              Home
            </Link>

            <Link
              href="/form"
              className="text-white dark:text-gray-400 hover:text-blue-200 transition-colors"
            >
              Student Registration Form
            </Link>
            {/* <Link
              href="/weather"
              className="text-white hover:text-blue-200 transition-colors"
            >
              Weather Excercise
            </Link> */}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Heading />
        {children}
      </body>
    </html>
  );
}
