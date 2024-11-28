
import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import { cn } from '@/lib/utils'
import "./globals.css";

const fontHeading = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

const fontBody = Space_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: "400"
})

export const metadata: Metadata = {
  title: "BlockBolt ICP Approve",
  description: "BlockBolt ICP Approve Dapp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'antialiased',
          fontHeading.variable,
          fontBody.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
