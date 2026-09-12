import type { Metadata } from "next";
import { Header } from "@/components/header";
import { GeneratedStatus } from "@/components/generated-status";
import { getMetadata } from "@/lib/data/loader";
import "./globals.css";

const title = "布丁 / Buding — Linux Chinese Documentation Patch Tracker";
const description = "Track Linux Chinese documentation patches from lore through maintainer trees to mainline.";
const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const deploymentUrl = deploymentHost?.startsWith("http") ? deploymentHost : deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(deploymentUrl),
  title,
  description,
  openGraph: {
    type: "website",
    siteName: "Buding",
    title,
    description,
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const metadata = getMetadata();

  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="shell footer-inner">
            <span><strong>Buding</strong> · Linux Chinese documentation patch tracker</span>
            <GeneratedStatus generatedAt={metadata.generatedAt} label="Updated" />
          </div>
        </footer>
      </body>
    </html>
  );
}
