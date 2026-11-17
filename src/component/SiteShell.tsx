import React, { useEffect, useRef } from "react";
import { go, resetLeaving } from "../lib/site/shell";

type Props = {
  /** Which word in the bottom menu is lit. */
  active?: "home" | "projects" | "about" | "contact";
  /** Show the "← Back" link in the top-left corner. */
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
  /** Hide the name in the top-right corner (project pages). */
  showBrand?: boolean;
  children?: React.ReactNode;
};

// Header, bottom word menu and the "Learn More" cursor shared by every page.
export default function SiteShell({
  active = "home",
  showBack = false,
  backHref = "/",
  backLabel = "to the gallery",
  showBrand = true,
  children,
}: Props) {
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    const menu = menuRef.current;
    if (!header || !menu) return;
    const toggle = header.querySelector(".menu-toggle")!;

    // phones: the bottom word menu becomes a full-screen overlay behind the hamburger.
    // Toggled on the DOM, not React state, because pages also flip .is-hidden on the same nodes.
    const setMenuOpen = (open: boolean) => {
      menu.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    const onToggle = () => setMenuOpen(!menu.classList.contains("is-open"));
    toggle.addEventListener("click", onToggle);

    // the back link steps aside while scrolling down and returns on the way up
    let lastScrollY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled-down", y > 50 && y > lastScrollY);
      lastScrollY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // internal links fade the page out before the browser loads the next one
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[data-link]") as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!href) return;
      e.preventDefault();
      setMenuOpen(false);
      if (href !== location.pathname) go(href);
    };
    document.addEventListener("click", onClick);

    const onPageShow = (e: PageTransitionEvent) => e.persisted && resetLeaving();
    window.addEventListener("pageshow", onPageShow);

    return () => {
      toggle.removeEventListener("click", onToggle);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  const nav = (key: string) => `word big link${active === key ? " active" : ""}`;

  return (
    <div id="app">
      <header className="app-header" ref={headerRef}>
        {showBack && (
          <a href={backHref} className="back-link" data-link>
            <span className="back-top">
              <span className="arrow">&larr;</span>Back
            </span>
            <span className="back-sub">{backLabel}</span>
          </a>
        )}
        <a href="/" className={`brand${showBrand ? "" : " invisible"}`} data-link>
          <span className="brand-name">
            <span className="bw">Aren</span>
            <span className="bw">Vale</span>
          </span>
          <span className="brand-sub">Composer</span>
        </a>
        <button className="menu-toggle" type="button" aria-label="Menu" aria-expanded="false">
          <span></span>
          <span></span>
        </button>
      </header>
      <main id="view">{children}</main>
      <nav className="app-menu" ref={menuRef}>
        <div className="menu-row">
          <span className="word small">explore</span>
          <a href="/projects" className={nav("projects")} data-link>
            <span>work</span>
          </a>
          <span className="word small">read</span>
          <a href="/about" className={nav("about")} data-link>
            <span>about</span>
          </a>
          <span className="word small">me</span>
        </div>
        <div className="menu-row">
          <span className="word small">or</span>
          <a href="/contact" className={nav("contact")} data-link>
            <span>contact</span>
          </a>
        </div>
      </nav>
      <div className="a-cursor" aria-hidden="true"></div>
    </div>
  );
}
