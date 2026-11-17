import React from "react";
import { Letters, Slide, SocialLink, Video } from "./parts";

function Zigzag({ text }: { text: string }) {
  return (
    <span className="ib t12 abm-zz">
      {[...text].map((c, s) => (
        <span className={`abm-zz-l${(s + 1) % 2 === 0 ? " down" : ""}`} key={s}>
          {c}
        </span>
      ))}
    </span>
  );
}

// Parallax.vue picture in the stacked image grid; offsets are percentages of the column / vw
function GridImage({ src, left, top, width, parallax = 0 }: { src: string; left: number; top: number; width: number; parallax?: number }) {
  return (
    <div className="abm-grid-item" data-parallax={parallax} style={{ left: `${left}%`, marginTop: `${top}vw`, width: `${width}%` }}>
      <img src={src} alt="" />
    </div>
  );
}

// Phone About (below 640px): stacked sections that each play a short intro when scrolled into view
// (lib/site/about-mobile.ts). Same copy as AboutDesktop.tsx, laid out for a narrow screen.
export default function AboutMobile() {
  return (
    <div className="about-mobile upper">
      <section className="abm-hero" data-wp="hero">
        <div className="abm-cover">
          <Video src="https://assets.mixkit.co/videos/42834/42834-720.mp4" />
        </div>
        <div className="rel wfull" data-fade="0.2">
          <h1 className="abm-hero-text">
            <span className="abm-hero-row">
              <span className="big">Aren</span>
              <span className="small">writes</span>
            </span>
            <span className="abm-hero-row">
              <span className="big">Scores</span>
              <span className="small">for</span>
              <span className="big">Screen + Play</span>
            </span>
          </h1>
        </div>
        <div className="rel wfull abm-hero-2" data-fade="0.3">
          <h2 className="abm-hero-text">
            <span className="abm-hero-row">
              <span className="small">And also</span>
            </span>
            <span className="abm-hero-row">
              <span className="big">Arranger</span>
            </span>
            <span className="abm-hero-row">
              <span className="small">and</span>
            </span>
            <span className="abm-hero-row">
              <span className="big">Sound Designer</span>
            </span>
            <span className="abm-hero-row">
              <span className="small">and</span>
            </span>
            <span className="abm-hero-row">
              <span className="big">Field recordist</span>
            </span>
          </h2>
        </div>
      </section>

      <section className="abm-rows" data-wp="rows">
        <div className="abm-rows-in t12">
          <div className="abm-row">Raised in a small</div>
          <div className="abm-row">harbour town, she</div>
          <div className="abm-row">learned music from</div>
          <div className="abm-row gap">the fishing bands</div>
          <div className="abm-row">that played the</div>
          <div className="abm-row">quayside every</div>
          <div className="abm-row">weekend. Soon she</div>
          <div className="abm-row">was playing her own</div>
          <div className="abm-row">harbour town nights</div>
        </div>
      </section>

      <section className="abm-two" data-wp="two">
        <p className="abm-two-title" data-fade="0.1">
          Harbour town nights
        </p>
        <div className="abm-two-imgs">
          <div data-fade="0.2" data-rotate="-10">
            <img src="/assets/158_1264x1309.jpg" alt="" />
          </div>
          <div className="abm-two-small" data-fade="0.3" data-rotate="10">
            <img src="/assets/159_769x731.jpg" alt="" />
          </div>
        </div>
      </section>

      <section className="abm-rows" data-wp="rows">
        <div className="abm-rows-in t12">
          <div className="abm-row">Trading the stage</div>
          <div className="abm-row">for the open road,</div>
          <div className="abm-row">Aren packed up a</div>
          <div className="abm-row">small studio, said</div>
          <div className="abm-row">goodbye to the city</div>
          <div className="abm-row gap">and set off.</div>
          <div className="abm-row">Recording rain,</div>
          <div className="abm-row">markets, wildlife</div>
          <div className="abm-row">and wind, carrying</div>
          <div className="abm-row">little more than a</div>
          <div className="abm-row">field</div>
        </div>
      </section>

      <section className="abm-vt" data-wp="vt">
        <div className="abm-cover" data-r="vtVideo">
          <Video src="https://assets.mixkit.co/videos/4092/4092-720.mp4" />
        </div>
        <div className="abm-vt-head" data-r="vtHead">
          <h2 className="flex col items-center jc">
            <span className="t32 rel flex" data-in="">
              <Letters text="Recorder" hook="data-l" />
              <span className="c-white20 abs tl">
                <Letters text="Recorder" />
              </span>
            </span>
            <Zigzag text="and" />
            <Zigzag text="a" />
            <span className="t32 rel flex">
              <Letters text="Passport" hook="data-l" />
              <span className="c-white20 abs tl">
                <Letters text="Passport" />
              </span>
            </span>
          </h2>
        </div>
      </section>

      <section className="abm-countries" data-wp="countries">
        <div className="abm-top-caption t12" data-fade="0">
          <p>
            Recording hydrophone
            <br />
            audio for marine
            <br />
            documentaries
            <br />
            along the way
          </p>
          <p></p>
          <p>
            kept the journey going,
            <br />
            {" with recordings from"}
            <br />
            {" more than 30 countries"}
          </p>
        </div>
        <div className="abm-slider" data-r="slider">
          <Slide country="Iceland" caption="Hydrophones lowered beside a glacier lagoon at sunrise." image="/assets/160_1054x596.jpg" />
          <Slide country="Namibia" caption="A full night of desert wind, recorded from a single tent." image="/assets/161_1054x596.jpg" />
          <Slide country="Ghana" caption="An afternoon jam with street drummers that turned into a three-hour session." image="/assets/162_1054x596.jpg" />
          <Slide country="Mongolia" caption="Throat singers and horse fiddles around a winter fire." image="/assets/163_1054x596.jpg" />
          <Slide caption="The most patient collaborator so far: a very curious seal." image="/assets/164_1054x596.jpg" />
          <Slide country="Patagonia" caption="Wind so strong the windshield needed its own windshield." image="/assets/165_1054x596.jpg" />
          <Slide country="Sri Lanka" caption="Temple bells echoing across the hills before dawn." image="/assets/166_1054x596.jpg" />
          <Slide country="New Zealand" caption="Birdsong in an old-growth forest, recorded at 4am." image="/assets/167_1054x596.jpg" />
        </div>
        <p className="abm-slider-cap t11" data-r="sliderCap"></p>
      </section>

      <section className="abm-four" data-wp="four">
        <div className="abm-cover abm-dim">
          <Video src="https://assets.mixkit.co/videos/4831/4831-720.mp4" />
        </div>
        <h3 className="abm-four-text">
          <span className="t10 mb2" data-fade="0.0">Composing</span>
          <span className="t10 mb6" data-fade="0.1">and mixing for</span>
          <span className="t22 big" data-fade="0.2">TRAILERS</span>
          <span className="t10" data-fade="0.3">and</span>
          <span className="t22 big mb10 mt4" data-fade="0.4">ADVERTS</span>
        </h3>
      </section>

      <section className="abm-rows" data-wp="rows">
        <div className="abm-rows-in t12 is-wrapped">
          <div className="abm-row gap-lg" style={{ width: "40ch" }}>Back home, Aren spent a decade composing music for trailers and adverts,</div>
          <div className="abm-row gap-lg" style={{ width: "35ch" }}>thirty-second stories for sneakers, cars and coffee brands</div>
          <div className="abm-row gap-lg" style={{ width: "35ch" }}>plus sonic logos, podcast idents, game trailers and the occasional ringtone.</div>
          <div className="abm-row" style={{ width: "31ch" }}>Every tight brief sharpened the instincts she now brings to long-form SCORING</div>
        </div>
      </section>

      <section className="abm-image" data-wp="image">
        <div className="abm-caption-space"></div>
        <div className="abm-image-head t32" data-fade="0.2">
          <p className="top">Film + Series</p>
          <img src="/assets/168_903x600.jpg" alt="" />
          <p className="bottom">Games + Concerts</p>
        </div>
        <div className="abm-caption-space"></div>
      </section>

      <section className="abm-grid">
        <GridImage src="/assets/169_401x283.jpg" left={58.12} top={0} width={37.5} parallax={0.1} />
        <GridImage src="/assets/170_356x201.jpg" left={3.12} top={20} width={43.43} />
        <GridImage src="/assets/171_339x225.jpg" left={14.68} top={0} width={70.31} parallax={-0.05} />
        <GridImage src="/assets/172_393x292.jpg" left={51.87} top={10} width={43.43} />
        <GridImage src="/assets/173_475x314.jpg" left={3.12} top={-15} width={45} parallax={0.1} />
        <GridImage src="/assets/174_600x382.jpg" left={48.43} top={20} width={46.87} parallax={-0.1} />
        <GridImage src="/assets/175_579x386.jpg" left={3.12} top={-5} width={42.81} />
        <GridImage src="/assets/176_634x430.jpg" left={10} top={10} width={65.62} parallax={0.1} />
        <GridImage src="/assets/177_142x180.jpg" left={61} top={0} width={34.68} />
        <GridImage src="/assets/178_636x478.jpg" left={18.43} top={0} width={49} parallax={-0.1} />
        <GridImage src="/assets/179_402x226.jpg" left={3.12} top={12} width={45.31} parallax={-0.2} />
      </section>

      <section className="abm-socials" data-wp="socials">
        <p className="rel t10 abm-soc-hollow" data-r="socHollow">
          <span className="c-off20">For</span>
          <span className="abs tl wfull">For</span>
        </p>
        <h4 className="t20 abm-soc-title" data-r="socTitle">
          News +<br />
          Releases
        </h4>
        <p className="t10" data-r="socMid">
          <span className="abm-soc-mid">Follow</span>
          <span className="abm-soc-mid">Aren</span>
        </p>
        <SocialLink cls="abm-soc-item" size="t32" textSize="t10" first>On</SocialLink>
        <SocialLink cls="abm-soc-item" size="t32" textSize="t10" href="https://bandcamp.com/">Bandcamp</SocialLink>
        <SocialLink cls="abm-soc-item" size="t32" textSize="t10">Or</SocialLink>
        <SocialLink cls="abm-soc-item" size="t32" textSize="t10" href="https://www.instagram.com/">Instagram</SocialLink>
        <p className="abm-copy t10">&copy; All Rights Reserved {new Date().getFullYear()}</p>
      </section>
    </div>
  );
}
