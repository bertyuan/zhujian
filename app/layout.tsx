import type { Metadata } from "next";
import { Header } from "@/components/header";
import "./globals.css";

const title = "竹简 / Zhujian — Linux Chinese Documentation Patch Tracker";
const description = "Track Linux Chinese documentation patches from lore through maintainer trees to mainline.";
const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const deploymentUrl = deploymentHost?.startsWith("http") ? deploymentHost : deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(deploymentUrl),
  title,
  description,
  openGraph: {
    type: "website",
    siteName: "Zhujian",
    title,
    description,
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Zhujian Linux Chinese Documentation Patch Tracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
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
