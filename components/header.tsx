import Link from "next/link";

const links = [
  { href: "/", label: "Patchsets" },
  { href: "/board", label: "Board" },
  { href: "/messages", label: "Messages" },
];

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="Zhujian home">
          <span className="brand-mark">竹简</span>
          <span className="brand-name">Zhujian</span>
        </Link>
        <nav className="main-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <Link className="nav-link" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
          <a className="nav-link github-link" href="https://github.com/bertyuan/zhujian" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
