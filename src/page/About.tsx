import React, { useEffect, useRef } from "react";
import type { Metadata } from "../lib/talizen/types";
import SiteShell from "../component/SiteShell";
import AboutDesktop from "../component/about/AboutDesktop";
import AboutMobile from "../component/about/AboutMobile";
import { mountAboutDesktop } from "../lib/site/about-desktop";
import { mountAboutMobile } from "../lib/site/about-mobile";

export const metadata: Metadata = {
  title: "About | Aren Vale",
};

export default function Page() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // both layouts are rendered and CSS shows one; animate the one on screen (decided once, like the original)
    return window.matchMedia("(max-width: 639px)").matches
      ? mountAboutMobile(root.querySelector(".about-mobile"))
      : mountAboutDesktop(root.querySelector(".about-page"));
  }, []);

  return (
    <SiteShell active="about">
      <div ref={rootRef}>
        <AboutDesktop />
        <AboutMobile />
      </div>
    </SiteShell>
  );
}
