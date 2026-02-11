import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

// Configure Geist Sans font and expose it as a CSS variable
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

// Configure Geist Mono font and expose it as a CSS variable
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// Default metadata applied to all pages in the app
export const metadata = {
    title: "CMPS 207 - Assignment 2",
    description: "Assignment 2 Next App",
};

// Top navigation bar component
export function Heading() {
    return (
        <nav className="bg-blue-600 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-1">
                <div className="flex justify-between items-center py-4">
                    {/* App title / home link */}
                    <Link href="/" className="text-white text-xl font-bold">
                        Assignment 2
                    </Link>

                    {/* Navigation links */}
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

                        {/* Example of a future/disabled route */}
                        {/* 
            <Link
              href="/weather"
              className="text-white hover:text-blue-200 transition-colors"
            >
              Weather Exercise
            </Link> 
            */}
                    </div>
                </div>
            </div>
        </nav>
    );
}

// Root layout applied to all routes
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                // Apply font variables and enable smoother font rendering
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {/* Global navigation */}
                <Heading />

                {/* Page-specific content */}
                {children}
            </body>
        </html>
    );
}
