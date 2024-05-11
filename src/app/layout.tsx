import StyledComponentsRegistry from "../lib/registry";

import type { Metadata } from "next";
import "./globals.css";

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
      <body >
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
