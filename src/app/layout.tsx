import StyledComponentsRegistry from "../lib/registry";

import type { Metadata } from "next";
import "./globals.css";
import { SUBTITLE, TITLE } from "./components/pages/home";

export const metadata: Metadata = {
  title: TITLE,
  description: SUBTITLE,
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
