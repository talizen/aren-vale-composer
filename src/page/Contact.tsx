import React from "react";
import type { Metadata } from "../lib/talizen/types";
import SiteShell from "../component/SiteShell";

export const metadata: Metadata = {
  title: "Contact | Aren Vale",
};

export default function Page() {
  return (
    <SiteShell active="contact">
      <section className="contact-page">
        <p className="contact-label text-10">
          Film / Series / Games
          <br />
          Representation
        </p>
        <p className="contact-name text-24">Jordan Ellis</p>
        <p className="contact-company text-10">Northlight Artists</p>
        <a className="contact-phone" href="tel:+15550102040">
          +1 (555) 010-2040
        </a>
        <a className="contact-email text-20" href="mailto:bookings@example.com">
          bookings@example.com
        </a>
        <div className="contact-bio">
          <p className="contact-label text-10">
            Aren’s
            <br />
            Press kit
          </p>
          <a
            className="link text-20"
            href="/assets/press_kit.pdf"
            target="_blank"
            rel="noopener"
          >
            Download
          </a>
        </div>
        <div className="contact-credit">
          <p className="row">
            <span>site</span> <span>designed</span> <span>and</span> <span>built</span> <span>by</span>
          </p>
          <a className="link text-12" href="#" target="_blank" rel="noopener">
            Your Studio Name
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
