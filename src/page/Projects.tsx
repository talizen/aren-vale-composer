import React, { useEffect, useRef } from "react";
import type { GetServerSideProps, InferGetServerSidePropsType, Metadata } from "../lib/talizen/types";
import { listContents } from "../lib/talizen/cms";
import type { Projects } from "../types/cms";
import SiteShell from "../component/SiteShell";
import { mountProjects } from "../lib/site/projects";

export const metadata: Metadata = {
  title: "Work | Aren Vale",
};

type Row = { uid: string; title: string; preview: string };

export const getServerSideProps: GetServerSideProps<{ projects: Row[] }> = async () => {
  const res = await listContents<Projects>("projects", { limit: 100 });
  const projects = (res?.list ?? []).map((p) => ({
    uid: p.slug,
    title: p.body?.title ?? "",
    preview: (p.body?.video_preview as unknown as string) ?? "",
  }));
  return { props: { projects } };
};

const pad = (n: number) => String(n).padStart(3, "0");

export default function Page({ projects = [] }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef.current) return mountProjects(rootRef.current);
  }, []);

  return (
    <SiteShell active="projects" showBack backHref="/" backLabel="to the gallery">
      <div className="index-view" ref={rootRef}>
        <div className="index-preview">
          <video muted loop playsInline preload="none"></video>
        </div>
        <ul className="index-list">
          {projects.map((p, i) => (
            <li key={p.uid}>
              <a href={`/projects/${p.uid}`} data-link data-preview={p.preview || undefined}>
                <span className="num">{pad(i + 1)}</span>
                <span className="title">{p.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </SiteShell>
  );
}
