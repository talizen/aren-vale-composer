import React from "react";

// Building blocks for the About page. Copy is passed in from component/about/AboutDesktop.tsx and
// AboutMobile.tsx; the class names and data-* hooks are what lib/site/about-*.ts animate.

const ch = (c: string) => (c === " " ? " " : c);
const flag = (name?: string) => (name ? { [name]: "" } : {});

/** One <span class="ib"> per character, optionally tagged with a data-* hook. */
export function Letters({ text, hook }: { text: string; hook?: string }) {
  return (
    <>
      {[...text].map((c, i) => (
        <span className="ib" key={i} {...flag(hook)}>
          {ch(c)}
        </span>
      ))}
    </>
  );
}

// preload stays "none" until lib/site/about-*.ts picks the layout that is actually on screen
export function Video({ src }: { src: string }) {
  return <video src={src} muted loop playsInline preload="none"></video>;
}

// ---------- Desktop ----------

// Text.vue: big white words with small grey joining words
export function HeroText({ as: Tag = "h1", children }: { as?: "h1" | "h2"; children: React.ReactNode }) {
  return (
    <div className="ab-hero">
      <Tag className="upper t42 tc">{children}</Tag>
    </div>
  );
}

export function HeroRow({ children }: { children: React.ReactNode }) {
  return <span className="ab-hero-row">{children}</span>;
}

export function HeroWord({ small = false, special = "", children }: { small?: boolean; special?: string; children: string }) {
  return <span className={`${small ? "t20 c-off" : "t42 c-white"} ${special} ab-mx`}>{children}</span>;
}

type WordProps = { children: string; split?: boolean };

/** A word inside <MagicText> or <BottomCaption>; `split` drops its letters one by one. */
export function MagicWord(_: WordProps): null {
  return null;
}

function words(children: React.ReactNode) {
  return React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<WordProps>[];
}

// MagicText1.vue: a diagonal staircase of words, each row indented by `indent[row]`
export function MagicText({
  hook,
  className = "",
  indent = {},
  step = 1,
  children,
}: {
  hook: string;
  className?: string;
  indent?: Record<number, string>;
  step?: number;
  children: React.ReactNode;
}) {
  return (
    <h3 className={`ab-magic1 ${className}`} data-r={hook}>
      {words(children).map(({ props: w }, a) => {
        const style = { marginTop: `${a * step}em`, ...(indent[a] ? { marginLeft: indent[a] } : {}) };
        if (!w.split)
          return (
            <span className="ib rel nowrap" style={style} key={a}>
              {w.children}
            </span>
          );
        return (
          <span className="ab-iflex rel" data-split="" style={style} key={a}>
            <div className="ab-hollow-word c-off20">
              <Letters text={w.children} />
            </div>
            {[...w.children].map((c, i) => (
              <div className="ab-fill" key={i}>
                {ch(c)}
              </div>
            ))}
          </span>
        );
      })}
    </h3>
  );
}

type RowProps = { children: string; hollow?: boolean; magic?: boolean; gap?: boolean };

// MagicExplodingTextRows.vue: `hollow` letters fly in, `magic` letters explode out
export function ExplodingRow({ children: text, hollow, magic, gap }: RowProps) {
  let inner;
  if (hollow)
    inner = (
      <span className="rel flex" data-fade="">
        <span>
          <Letters text={text} hook="data-hl" />
        </span>
        <span className="c-off40 abs tl flex">
          <Letters text={text} />
        </span>
      </span>
    );
  else if (magic)
    inner = (
      <span className="rel flex">
        <span>
          <Letters text={text} hook="data-ml" />
        </span>
        <span className="c-off40 abs tl ib" data-fade="">
          {text}
        </span>
      </span>
    );
  else
    inner = (
      <span className="ib" data-fade="">
        {text}
      </span>
    );
  return (
    <div className={`ab-rowline${gap ? " mb4" : ""}`} data-row="">
      {inner}
    </div>
  );
}

// MagicTextRows.vue
export function MagicRow({ children: text, hollow, magic, gap }: RowProps) {
  let inner;
  if (hollow)
    inner = (
      <span className="rel flex">
        <span>
          <Letters text={text} hook="data-hl" />
        </span>
        <span className="c-off40 abs tl flex">
          <Letters text={text} />
        </span>
      </span>
    );
  else if (magic)
    inner = (
      <span className="rel flex">
        <span>
          <Letters text={text} hook="data-ml" />
        </span>
        <span className="c-off40 abs tl">{text}</span>
      </span>
    );
  else inner = <span>{text}</span>;
  return (
    <div className={`ab-rowline${gap ? " mb4" : ""}`} data-row="">
      {inner}
    </div>
  );
}

// SwirlyText.vue: the sentence rides SVG paths; a third of its words drift along each side path
export function SwirlyText({ text }: { text: string }) {
  const all = text.split(" ");
  const ws = all.filter((w) => w !== "");
  const third = Math.floor(ws.length / 3);
  return (
    <div className="ab-swirly-pos">
      <div className="ab-swirly upper c-off">
        <svg className="ab-swirly-svg" preserveAspectRatio="none" viewBox="0 0 1920 1080" fill="none">
          <path data-path="left" d="M1019.5 1080L582.462 793.917C520.104 753.098 485.616 680.991 492.978 606.826L514.5 390" />
          <path
            data-path="middle"
            d="M790.284 1084.5L883.032 848.281C901.64 800.889 901.473 748.184 882.564 700.911L824.812 556.524C802.918 501.788 806.288 440.181 834.022 388.16L854.899 349"
          />
          <path data-path="right" d="M1038 1081.5L1264.2 832.344C1339.94 748.915 1331.84 619.417 1246.29 546.075L1066 391.5" />
          <path
            data-path="swirly"
            d="M1643.5 1087.5L1820.68 901.164C1879.88 838.908 1838.29 735.67 1752.48 731.656C1413.78 715.811 772.374 682.927 471.5 648.502C239.801 621.991 127.685 559.635 73.738 509.116C36.3139 474.071 62.0991 424.714 111.553 411.184L560 288.5"
          />
        </svg>
        {all.map((w, i) => (
          <div key={`w${i}`}>
            <span className="ib" data-sw="">
              {w}
            </span>
          </div>
        ))}
        {ws.slice(0, third).map((w, i) => (
          <span className="c-off20 t14" data-swl="" key={`l${i}`}>
            {w}
          </span>
        ))}
        {ws.slice(third, third * 2).map((w, i) => (
          <span className="c-off20 t14" data-swm="" key={`m${i}`}>
            {w}
          </span>
        ))}
        {ws.slice(third * 2, 100).map((w, i) => (
          <span className="c-off20 t14" data-swr="" key={`r${i}`}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

// VideoAndText.vue headline: a word whose letters drop in (`in`) or blow away (`out`) over a ghost copy
export function MagicHeadline({ text, mode, size = "t82" }: { text: string; mode: "in" | "out"; size?: string }) {
  return (
    <span className={`${size} rel flex`} data-vrow={mode}>
      <Letters text={text} hook="data-l" />
      <span className="c-white20 abs tl">
        <Letters text={text} />
      </span>
    </span>
  );
}

export function ZigzagWord({ text }: { text: string }) {
  return (
    <span className="ib t30 ab-zz" data-vrow="zz">
      {[...text].map((c, s) => (
        <span className={`ab-zz-l${(s + 1) % 2 === 0 ? " down" : ""}`} key={s}>
          {c}
        </span>
      ))}
    </span>
  );
}

// Countries.vue: names bow out to the right at both ends of the list
export const countryOffsets = (n: number) => {
  const mid = Math.floor(n / 2);
  return Array.from({ length: n }, (_, o) => 10 * Math.pow(Math.abs(o - mid) / mid, 2));
};

const BOTTOM_CAPTION_INDENT: Record<number, string> = {
  1: "-8em",
  2: "-7em",
  3: "-4em",
  4: "-1.5em",
  5: "-1.75em",
  6: "-1.75em",
  7: "-2.75em",
  8: "-.75em",
};

/** The growing caption lines, the country list and the caption that follows it (children: <MagicWord>s). */
export function CountryList({ captions, countries, children }: { captions: string[]; countries: string[]; children: React.ReactNode }) {
  const x = countryOffsets(countries.length);
  return (
    <>
      {captions.map((c, o) => (
        <p
          className="ab-c-cap t20"
          data-cc=""
          style={{ fontSize: `${0.3 + o / 8}rem`, left: `${x[0]}vw`, marginLeft: `${captions.length - o}vw` }}
          key={o}
        >
          {c}
        </p>
      ))}
      <div className="ab-c-list">
        {countries.map((c, o) => (
          <p className="t20 rel" data-cn="" style={{ left: `${x[o]}vw` }} key={o}>
            {c}
          </p>
        ))}
      </div>
      {/* CountriesBottomCaption.vue */}
      <h3 className="ab-c-bottom t8" data-r="cBottom" style={{ left: `${x[x.length - 1] + 0.4}vw` }}>
        {words(children).map(({ props: w }, a) => {
          const style = { marginTop: `${a * 1.5}em`, ...(BOTTOM_CAPTION_INDENT[a] ? { marginLeft: BOTTOM_CAPTION_INDENT[a] } : {}) };
          if (!w.split)
            return (
              <span className="ib rel" style={style} key={a}>
                {w.children}
              </span>
            );
          return (
            <span className="ib rel" data-split="" style={style} key={a}>
              <div className="ab-hollow-word c-white20">
                <Letters text={w.children} />
              </div>
              {[...w.children].map((c, i) => (
                <div className="ab-fill" key={i}>
                  {ch(c)}
                </div>
              ))}
            </span>
          );
        })}
      </h3>
    </>
  );
}

/** A slideshow picture; country and caption show underneath while it is up. */
export function Slide({ image, country = "", caption }: { image: string; country?: string; caption: string }) {
  return <img src={image} alt="" data-country={country} data-caption={caption} />;
}

// FourVideosAndText.vue: the tiles stand up as the walls of a hexagonal tunnel
function tileStyle(i: number, count: number): React.CSSProperties {
  const center = 50;
  const size = 55;
  const half = size / 2;
  const r = (size + 15) * Math.cos(Math.PI / count);
  const step = 360 / count;
  const angle = -step / 2 + i * step;
  const rad = (angle * Math.PI) / 180;
  return {
    top: `${center + r * Math.sin(rad) - half}vw`,
    left: `${center + r * Math.cos(rad) - half}vw`,
    transform: `rotateX(-90deg) rotateY(${-(angle + 90)}deg)`,
    transformOrigin: "center",
  };
}

export function VideoTunnel({ videos }: { videos: string[] }) {
  return (
    <div className="ab-four-outer">
      <div className="ab-four-wrap" data-r="fvWrap">
        {videos.map((v, i) => (
          <div className="ab-tile" style={tileStyle(i, videos.length)} key={i}>
            <Video src={v} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TunnelRow({ big, space, children }: { big?: boolean; space?: boolean; children: string }) {
  const cls = `ab-mw${big ? " ab-fv-big t82" : ""}${space && !big ? " mb10" : ""}${space && big ? " mb14" : ""}`;
  return (
    <div className={cls} data-fv1="">
      {children}
    </div>
  );
}

// ImageGrid positions (5pIvSm1r.js)
const GRID: React.CSSProperties[] = [
  { width: "10.4vw", left: "59.3%", top: "32.7%" }, { width: "9.2vw", left: "31.8vw", top: "32.7%" },
  { width: "8.8vw", left: "45.5%", top: "44%", opacity: 0 }, { width: "10.1vw", left: "52.1%", top: "60.6%" },
  { width: "12.3vw", left: "44vw", top: "16.75%" }, { width: "10vw", left: "11vw", top: "10%" },
  { width: "15vw", left: "70.1%", top: "69.9%" }, { width: "16.7vw", left: "83.5%", top: "31.5%" },
  { width: "3.6vw", left: "94vw", top: "12.5%" }, { width: "16.5vw", left: "8%", top: "32%" },
  { width: "10.41vw", left: "4.2%", top: "70.7%" }, { width: "6.6vw", left: "4.6vw", top: "5%" },
  { width: "6.7vw", left: "28.8vw", top: "2%" }, { width: "8.8vw", left: "55%", top: "9.6%" },
  { width: "12vw", left: "81.8vw", top: "1%" }, { width: "9vw", left: "68.5vw", top: "25%" },
  { width: "4.3vw", left: "74%", top: "47%" }, { width: "8.1vw", left: "1.4%", top: "53.3%" },
  { width: "11.4vw", left: "30.1%", top: "56.5%" }, { width: "7vw", left: "84.4%", top: "67.4%" },
  { width: "8.2vw", left: "23.5%", top: "68.5%" }, { width: "12.4vw", left: "17.6%", top: "87.8%" },
  { width: "11vw", left: "87.8%", top: "88.5%" },
];

export function ImageCloud({ images }: { images: string[] }) {
  return (
    <div className="ab-grid-wrap" data-r="gWrap">
      {images.map((src, i) => (
        <div className="ab-mom" style={GRID[i] || {}} key={i}>
          <img src={src} alt="" />
        </div>
      ))}
    </div>
  );
}

// ImageGrid.vue headline: two phrases fly in around the main image
export function GridHeadline({ left, right, leftCaption = "", rightCaption = "" }: { left: string; right: string; leftCaption?: string; rightCaption?: string }) {
  return (
    <h3 className="ab-g-head" data-r="gHead">
      <span className="t14 c-off" data-r="gLC">
        {leftCaption}
      </span>
      <span className="t60 c-off20 rel ab-g-left">
        <span data-r="gLT">{left}</span>
        <span className="abs tl c-white70">
          <Letters text={left} hook="data-gl" />
        </span>
      </span>
      <span className="t60 c-off20 rel ab-g-right">
        <span data-r="gRT">{right}</span>
        <span className="abs tl c-white70">
          <Letters text={right} hook="data-gr" />
        </span>
      </span>
      <span className="t14 c-off" data-r="gRC">
        {rightCaption}
      </span>
    </h3>
  );
}

export function SocialLink({ href, children, first, size = "t40", textSize = "t14", cls = "ab-soc-item" }: { href?: string; children: string; first?: boolean; size?: string; textSize?: string; cls?: string }) {
  return (
    <div className={`${cls}${first ? " first" : ""}`} data-sli="">
      {href ? (
        <a className={size} href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <p className={textSize}>{children}</p>
      )}
    </div>
  );
}
