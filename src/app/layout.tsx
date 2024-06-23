import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";

import StyledComponentsRegistry from "../lib/registry";

import "./globals.css";
import { SUBTITLE, TITLE } from "./components/pages/home";
import { Navigation } from "./components/navigation";
import { Background } from "./components/background";

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
      <html lang="en">
        <body>
          <StyledComponentsRegistry>
            <Background />
            <Navigation />
            {children}
          </StyledComponentsRegistry>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </>
  );
}
