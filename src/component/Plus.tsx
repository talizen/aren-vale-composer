import React from "react";

// Plus.vue: two 1px lines in a 100×100 viewBox; `close` turns it into an ×
export function Plus({ close = false }: { close?: boolean }) {
  return (
    <span className={`plus${close ? " is-close" : ""}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <line x1="0" y1="50" x2="100" y2="50" />
        <line x1="50" y1="0" x2="50" y2="100" />
      </svg>
    </span>
  );
}

// LinkPlus.vue: a plus with a label underneath, as a link or a button
export function LinkPlus({
  label,
  size = "text-20",
  href,
  close = false,
}: {
  label: string;
  size?: string;
  href?: string;
  close?: boolean;
}) {
  const inner = (
    <>
      <Plus close={close} />
      <span className={`label ${size}`}>{label}</span>
    </>
  );
  return href ? (
    <a href={href} className="link-plus" data-link>
      {inner}
    </a>
  ) : (
    <button type="button" className="link-plus">
      {inner}
    </button>
  );
}
