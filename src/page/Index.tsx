import React, { useEffect, useRef } from "react";
import type { GetServerSideProps, InferGetServerSidePropsType, Metadata } from "../lib/talizen/types";
import { listContents } from "../lib/talizen/cms";
import type { Projects } from "../types/cms";
import SiteShell from "../component/SiteShell";
import { Plus } from "../component/Plus";
import { mountHome } from "../lib/site/home";

export const metadata: Metadata = {
  title: "Aren Vale | Composer for Film, Series and Games",
};

type ProjectInfo = { uid: string; title: string; description: string };

export const getServerSideProps: GetServerSideProps<{ projects: ProjectInfo[] }> = async () => {
  const res = await listContents<Projects>("projects", { limit: 100 });
  const projects = (res?.list ?? []).map((p) => ({
    uid: p.slug,
    title: p.body?.title ?? "",
    description: p.body?.description ?? "",
  }));
  return { props: { projects } };
};

export default function Page({ projects = [] }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef.current) return mountHome(rootRef.current);
  }, []);

  return (
    <SiteShell active="home">
      {/* the gallery lives in this box (not on the window) so the editor canvas renders it like the site */}
      <div className="home" ref={rootRef}>
        <canvas id="stage" className="is-hidden"></canvas>
        <div className="home-ui">
          <a href="/projects" className="index-link" data-link data-slot="index">
            <div className="link-plus">
              <Plus />
              <p className="label text-20">Index View</p>
            </div>
          </a>
          {/* shown while the matching photo is hovered */}
          {projects.map((p) => (
            <div className="project-info" data-slot={p.uid} key={p.uid} hidden>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
