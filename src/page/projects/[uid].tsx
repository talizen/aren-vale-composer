import React, { useEffect, useRef } from "react";
import type { GetServerSideProps, InferGetServerSidePropsType } from "../../lib/talizen/types";
import { getContent, listContents } from "../../lib/talizen/cms";
import type { Projects } from "../../types/cms";
import SiteShell from "../../component/SiteShell";
import { LinkPlus, Plus } from "../../component/Plus";
import { mountProject } from "../../lib/site/project";

// CMS file fields hold the asset URL
const url = (f: unknown) => (typeof f === "string" ? f : "");

type Song = { title: string; url: string };
type Instrument = { title: string; text: string; image: string; video: string; sound: string };
type Project = {
  uid: string;
  title: string;
  description: string;
  more: string;
  videoPreview: string;
  video: string;
  musicForVideo: string;
  songs: Song[];
  instruments: Instrument[];
};
type Next = { uid: string; title: string; videoPreview: string };

export async function generateMetadata({ params }: { params: { uid: string } }) {
  const content = await getContent<Projects>("projects", params.uid);
  return {
    title: content?.body?.title ? `${content.body.title} | Aren Vale` : "Project | Aren Vale",
    description: content?.body?.description,
  };
}

export const getServerSideProps: GetServerSideProps<{ project: Project; next: Next }, { uid: string }> = async (
  context,
) => {
  const uid = context.params?.uid;
  // the "Next Project" link wraps around the whole list, so load it in display order
  const res = await listContents<Projects>("projects", { limit: 100 });
  const list = res?.list ?? [];
  const index = list.findIndex((p) => p.slug === uid);
  if (index < 0) return { notFound: true };
  const b = list[index].body;
  const n = list[(index + 1) % list.length];
  return {
    props: {
      project: {
        uid: list[index].slug,
        title: b?.title ?? "",
        description: b?.description ?? "",
        more: b?.additional_description ?? "",
        videoPreview: url(b?.video_preview),
        video: url(b?.video),
        musicForVideo: url(b?.music_for_video),
        songs: (b?.songs ?? []).map((s) => ({ title: s.title ?? "", url: url(s.url) })),
        instruments: (b?.instruments ?? [])
          .filter((i) => i.title)
          .map((i) => ({
            title: i.title,
            text: i.text ?? "",
            image: url(i.image),
            video: url(i.video),
            sound: url(i.sound),
          })),
      },
      next: { uid: n.slug, title: n.body?.title ?? "", videoPreview: url(n.body?.video_preview) },
    },
  };
};

const pad = (n: number) => String(n).padStart(3, "0");
const BADGE = "Inside the score";

export default function Page({ project: p, next }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current || !p) return;
    return mountProject(rootRef.current, { songs: p.songs, video: p.video, music_for_video: p.musicForVideo });
  }, [p?.uid]);

  if (!p) return null;

  return (
    <SiteShell active="projects" showBack backHref="/projects" backLabel="to all projects" showBrand={false}>
      <div className="project-page" ref={rootRef}>
        <div className="project-head">
          <h1 className="project-title">{p.title}</h1>
          <p className="project-desc text-10">{p.description}</p>
          {p.more && (
            <>
              <div className="project-more">
                <p className="project-desc text-10">{p.more}</p>
              </div>
              <LinkPlus label="More Info" size="text-10" />
            </>
          )}
          {p.videoPreview && (
            <a className="video-preview" data-play-video>
              <video src={p.videoPreview} muted loop playsInline autoPlay></video>
              <span className="vp-label text-12">Play Video</span>
            </a>
          )}
        </div>

        <div className="songs">
          {p.songs.map((s, i) => (
            <div className="song" key={i}>
              <span className="s-num text-10">{pad(i + 1)}</span>
              <span className="s-title text-20">{s.title}</span>
              <span className="s-play">
                <svg viewBox="0 0 10 10">
                  <path d="M2 1 L9 5 L2 9 Z" fill="none" stroke="currentColor" strokeWidth="0.9" />
                </svg>
              </span>
              <span className="s-time text-10">
                <span className="cur">0:00</span>/<span className="dur">0:00</span>
              </span>
              <span className="progress"></span>
            </div>
          ))}
        </div>

        <a className="next-project" href={`/projects/${next.uid}`} data-link>
          <p className="np-label text-8">
            Next
            <br />
            Project
          </p>
          <p className="np-title text-24">{next.title}</p>
          {next.videoPreview && (
            <span className="video-preview">
              <video src={next.videoPreview} muted loop playsInline autoPlay></video>
            </span>
          )}
        </a>

        {p.instruments.length > 0 && (
          <>
            <button className="behind-badge" type="button" aria-label={BADGE}>
              <svg viewBox="0 0 100 100">
                <defs>
                  <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                </defs>
                <text>
                  <textPath href="#badge-circle">{`${BADGE} · ${BADGE} ·`}</textPath>
                </text>
              </svg>
            </button>
            <div className="behind-overlay"></div>
            <aside className="behind-panel">
              <button className="behind-close" type="button" aria-label="Close">
                <Plus />
              </button>
              {p.instruments.map((ins, i) => (
                <div className={`instrument${i === 0 ? " is-open" : ""}`} key={i}>
                  <button className="instrument-head text-10" type="button">
                    {ins.title}
                  </button>
                  <div className="instrument-body">
                    <p className="text-8">{ins.text}</p>
                    {(ins.sound || ins.video) && (
                      <button className="play-sound text-8" type="button" data-sound={ins.sound}>
                        &#9655; Play Sound
                      </button>
                    )}
                    {ins.video ? (
                      <video src={ins.video} muted loop playsInline preload="metadata"></video>
                    ) : ins.image ? (
                      <img src={ins.image} alt="" className="mt-[.8rem] w-full" />
                    ) : null}
                  </div>
                </div>
              ))}
            </aside>
          </>
        )}

        {p.video && (
          <div className="video-overlay">
            <video playsInline preload="none"></video>
            <button className="vo-close text-8" type="button">
              <Plus />
              <span className="mt-[.5rem]">Close</span>
            </button>
            <div className="vo-bar text-10">
              <button className="vo-toggle" type="button">
                Pause
              </button>
              <div className="vo-track">
                <div className="vo-fill"></div>
              </div>
              <span className="vo-time">0:00/0:00</span>
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
