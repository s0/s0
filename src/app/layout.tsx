import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";

import StyledComponentsRegistry from "../lib/registry";

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
    <>
      <Analytics />
      <SpeedInsights />
      <html lang="en">
        <body>
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </body>
      </html>
    </>
  );
}
