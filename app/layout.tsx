import type { Metadata } from "next";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "竹简 / Zhujian — Linux Chinese Documentation Patch Tracker",
  description:
    "Track Linux Chinese documentation patches from lore through maintainer trees to mainline.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="shell footer-inner">
            <span>竹简 / Zhujian</span>
            <span>Git history is the source of truth.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
