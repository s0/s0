import StyledComponentsRegistry from "../lib/registry";

import type { Metadata } from "next";
import { Montserrat } from 'next/font/google/index'
import "./globals.css";

// const montserrat = new Montserrat({
//   subsets: ['latin'],
//   display: 'swap',
// });

export const metadata: Metadata = {
  title: "Sam Lanning",
  description:
    "Software Engineer - Developer Advocate - Speaker - Lighting Designer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* <link href="https://fonts.googleapis.com/css?family=Montserrat:400,500&display=swap" rel="stylesheet"> */}
      </head>
      <body >
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
