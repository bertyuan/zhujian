"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Patchsets" },
  { href: "/review", label: "Needs review" },
  { href: "/messages", label: "Messages" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="Zhujian home">
          <span className="brand-mark" aria-hidden="true">竹</span>
          <span className="brand-name"><strong>竹简</strong> / Zhujian</span>
        </Link>
        <nav className="main-nav" aria-label="Primary navigation">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link className={`nav-link ${active ? "active" : ""}`} href={link.href} key={link.href} aria-current={active ? "page" : undefined}>
                {link.label}
              </Link>
            );
          })}
          <a className="nav-link github-link" href="https://github.com/bertyuan/zhujian" target="_blank" rel="noreferrer">
            Source ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
