import React from "react";
import {
  HeroText,
  HeroRow,
  HeroWord,
  MagicText,
  MagicWord,
  ExplodingRow,
  MagicRow,
  SwirlyText,
  MagicHeadline,
  ZigzagWord,
  CountryList,
  Slide,
  VideoTunnel,
  TunnelRow,
  ImageCloud,
  GridHeadline,
  SocialLink,
  Letters,
  Video,
} from "./parts";

// Desktop About (640px and up): one 2000vh scroll track, every block below is a fixed layer that
// lib/site/about-desktop.ts animates as the page scrolls. The phone layout is AboutMobile.tsx, so copy
// changed here usually needs the same change there.
export default function AboutDesktop() {
  return (
    <div className="about-page">
      <div className="ab-ind" aria-hidden="true">
        <div className="ab-ind-item" data-ind="0">
          <span className="ab-ind-line"></span>
          <span className="ab-ind-title t12"></span>
        </div>
        <div className="ab-ind-item" data-ind="1">
          <span className="ab-ind-line"></span>
          <span className="ab-ind-title t12">Harbour town nights</span>
        </div>
        <div className="ab-ind-item" data-ind="2">
          <span className="ab-ind-line"></span>
          <span className="ab-ind-title t12">A recorder and a passport</span>
        </div>
        <div className="ab-ind-item" data-ind="3">
          <span className="ab-ind-line"></span>
          <span className="ab-ind-title t12">Trailers + adverts</span>
        </div>
        <div className="ab-ind-item" data-ind="4">
          <span className="ab-ind-line"></span>
          <span className="ab-ind-title t12">Long-form scoring</span>
        </div>
        <div className="ab-ind-box"></div>
      </div>

      <div className="ab-layer" data-r="introVideos">
        <div className="ab-intro-half">
          <Video src="https://assets.mixkit.co/videos/42834/42834-720.mp4" />
        </div>
        <div className="ab-intro-full" data-r="introWipe">
          <Video src="https://assets.mixkit.co/videos/42840/42840-720.mp4" />
        </div>
      </div>
      <div className="ab-fixed-center flex wfull" data-r="aboutText1">
        <HeroText as="h1">
          <HeroRow>
            <HeroWord>Aren</HeroWord>
            <HeroWord small special="ab-hero-drop">writes</HeroWord>
          </HeroRow>
          <HeroRow>
            <HeroWord>Scores</HeroWord>
            <HeroWord small>for</HeroWord>
            <HeroWord>Screen + Play</HeroWord>
          </HeroRow>
        </HeroText>
      </div>
      <div className="ab-fixed-center flex wfull" data-r="aboutText2">
        <HeroText as="h2">
          <HeroRow>
            <HeroWord small special="ab-hero-wide">And also</HeroWord>
          </HeroRow>
          <HeroRow>
            <HeroWord>Arranger</HeroWord>
            <HeroWord small>and</HeroWord>
            <HeroWord>Sound Designer</HeroWord>
          </HeroRow>
          <HeroRow>
            <HeroWord small>and</HeroWord>
            <HeroWord>Field recordist</HeroWord>
          </HeroRow>
        </HeroText>
      </div>

      <div className="ab-fixed-center c-off">
        <MagicText hook="magic1" className="t18" indent={{ 2: "-0.5em", 3: "-4.5em", 4: "-3em", 5: "-1.75em" }}>
          <MagicWord>Aren</MagicWord>
          <MagicWord>first</MagicWord>
          <MagicWord>climbed onto</MagicWord>
          <MagicWord>a piano bench</MagicWord>
          <MagicWord>and stayed</MagicWord>
          <MagicWord split>from age 6</MagicWord>
        </MagicText>
      </div>

      <div className="ab-fixed-center wfull flex jc">
        <div className="ab-mt2 upper c-off">
          <div className="ab-abs-center">
            <div className="ab-mt2-big" data-r="mt2Big">
              <img src="/assets/158_1264x1309.jpg" alt="" />
            </div>
            <div className="ab-mt2-small" data-r="mt2Small">
              <img src="/assets/159_769x731.jpg" alt="" />
            </div>
          </div>
          <div className="ab-rows t20" data-r="mt2Rows">
            <ExplodingRow hollow>Raised in a small</ExplodingRow>
            <ExplodingRow>harbour town, she</ExplodingRow>
            <ExplodingRow>learned music from</ExplodingRow>
            <ExplodingRow gap>the fishing bands</ExplodingRow>
            <ExplodingRow>that played the</ExplodingRow>
            <ExplodingRow>quayside every</ExplodingRow>
            <ExplodingRow>weekend. Soon she</ExplodingRow>
            <ExplodingRow>was playing her own</ExplodingRow>
            <ExplodingRow magic>harbour town nights</ExplodingRow>
          </div>
        </div>
      </div>

      <SwirlyText text="After years of late shows and borrowed stages, Aren traded the bandstand for a very different kind of stage" />

      <div className="ab-fixed-center wfull flex jc">
        <div className="ab-mt2 upper c-off">
          <div className="ab-rows t20" data-r="smRows">
            <MagicRow hollow>Trading the stage</MagicRow>
            <MagicRow>for the open road,</MagicRow>
            <MagicRow>Aren packed up a</MagicRow>
            <MagicRow>small studio, said</MagicRow>
            <MagicRow>goodbye to the city</MagicRow>
            <MagicRow gap>and set off.</MagicRow>
            <MagicRow>Recording rain,</MagicRow>
            <MagicRow>markets, wildlife</MagicRow>
            <MagicRow>and wind, carrying</MagicRow>
            <MagicRow>little more than a</MagicRow>
            <MagicRow magic>field</MagicRow>
          </div>
        </div>
      </div>

      <div className="ab-layer ab-vt upper c-white">
        <div className="ab-cover" data-r="vtVideo">
          <Video src="https://assets.mixkit.co/videos/4092/4092-720.mp4" />
        </div>
        <div className="ab-vt-center tc">
          <div data-r="vtHead">
            <h2 className="flex col items-center jc">
              <MagicHeadline text="Recorder" mode="in" />
              <ZigzagWord text="and" />
              <ZigzagWord text="a" />
              <MagicHeadline text="Passport" mode="out" />
            </h2>
            <p className="ab-vt-cap t16" data-r="vtCap">
              Recording hydrophone audio for marine documentaries along the way
            </p>
          </div>
        </div>
      </div>

      <div className="ab-countries upper c-white">
        <div className="ab-c-outer" data-r="cOuter">
          <div className="ab-c-wrap" data-r="cWrap">
            <CountryList
              captions={[
                "Sound jobs kept",
                "the journey going,",
                "with recordings from",
                "more than 30 countries",
              ]}
              countries={[
                "Iceland",
                "Norway",
                "Scotland",
                "Portugal",
                "Morocco",
                "Senegal",
                "Ghana",
                "Namibia",
                "Madagascar",
                "Oman",
                "Jordan",
                "Georgia",
                "Mongolia",
                "Sri Lanka",
                "Laos",
                "Philippines",
                "Taiwan",
                "New Zealand",
                "Fiji",
                "Chile",
                "Patagonia",
                "Uruguay",
                "Belize",
                "Guatemala",
                "Mexico",
                "Alaska",
                "Greenland",
                "Faroe Islands",
                "Slovenia",
                "Croatia",
                "Estonia",
                "Finland",
              ]}
            >
              <MagicWord>Back home</MagicWord>
              <MagicWord>Aren spent</MagicWord>
              <MagicWord>a decade</MagicWord>
              <MagicWord>composing</MagicWord>
              <MagicWord>music</MagicWord>
              <MagicWord>for</MagicWord>
              <MagicWord>TRAILERS</MagicWord>
              <MagicWord>and</MagicWord>
              <MagicWord split>adverts</MagicWord>
            </CountryList>
          </div>
        </div>
        <div className="ab-fixed-center" data-r="cSliderWrap">
          <div className="ab-slider-root" data-r="cSlider">
            <div className="ab-slider" data-r="slider">
              <Slide country="Iceland" caption="Hydrophones lowered beside a glacier lagoon at sunrise." image="/assets/160_1054x596.jpg" />
              <Slide country="Namibia" caption="A full night of desert wind, recorded from a single tent." image="/assets/161_1054x596.jpg" />
              <Slide country="Ghana" caption="An afternoon jam with street drummers that turned into a three-hour session." image="/assets/162_1054x596.jpg" />
              <Slide country="Mongolia" caption="Throat singers and horse fiddles around a winter fire." image="/assets/163_1054x596.jpg" />
              <Slide caption="The most patient collaborator so far: a very curious seal." image="/assets/164_1054x596.jpg" />
              <Slide country="Patagonia" caption="Wind so strong the windshield needed its own windshield." image="/assets/165_1054x596.jpg" />
              <Slide country="Sri Lanka" caption="Temple bells echoing across the hills before dawn." image="/assets/166_1054x596.jpg" />
              <Slide country="New Zealand" caption="Birdsong in an old-growth forest, recorded at 4am." image="/assets/167_1054x596.jpg" />
            </div>
            <div className="ab-slider-cap t11 c-off">
              <div className="ab-slider-cap-in" data-r="sliderCap">
                <p className="ab-slider-label"></p>
                <p className="ab-slider-text"></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ab-layer upper">
        <VideoTunnel
          videos={[
            "https://assets.mixkit.co/videos/40969/40969-720.mp4",
            "https://assets.mixkit.co/videos/74/74-720.mp4",
            "https://assets.mixkit.co/videos/4831/4831-720.mp4",
            "https://assets.mixkit.co/videos/236/236-720.mp4",
            "https://assets.mixkit.co/videos/43483/43483-720.mp4",
            "https://assets.mixkit.co/videos/3653/3653-720.mp4",
          ]}
        />
        <div className="ab-abs-center c-off">
          <h3 className="flex col items-center t14 tc" data-r="fvT1">
            <TunnelRow>Composing</TunnelRow>
            <TunnelRow>and</TunnelRow>
            <TunnelRow>mixing</TunnelRow>
            <TunnelRow space>for</TunnelRow>
            <TunnelRow big>TRAILERS</TunnelRow>
            <TunnelRow>and</TunnelRow>
            <TunnelRow big space>ADVERTS</TunnelRow>
          </h3>
        </div>
        <div className="ab-abs-center c-off">
          <h3 className="flex col items-center t14 tc" data-r="fvT2">
            <div className="ab-mw">Thirty-second stories</div>
            <div className="ab-mw">for sneakers, cars</div>
            <div className="ab-mw mb12">and coffee brands</div>
            <div className="ab-mw">PLUS SONIC LOGOS, PODCAST</div>
            <div className="ab-mw">IDENTS, GAME TRAILERS</div>
            <div className="ab-mw">AND THE OCCASIONAL</div>
            <div className="ab-mw">RINGTONE.</div>
          </h3>
        </div>
      </div>

      <MagicText
        hook="magic2"
        className="ab-fixed-center t14"
        step={1.5}
        indent={{ 2: "-0.5em", 3: "-0.5em", 4: "-1.75em", 5: "-4.25em", 6: "-3em", 7: "-3em", 8: "-0.75em", 9: "-0.75em" }}
      >
        <MagicWord>Every</MagicWord>
        <MagicWord>tight</MagicWord>
        <MagicWord>brief</MagicWord>
        <MagicWord>sharpened</MagicWord>
        <MagicWord>the instincts</MagicWord>
        <MagicWord>she now</MagicWord>
        <MagicWord>brings to</MagicWord>
        <MagicWord>film,</MagicWord>
        <MagicWord>series</MagicWord>
        <MagicWord>and</MagicWord>
        <MagicWord>games</MagicWord>
        <MagicWord split>long-form scoring</MagicWord>
      </MagicText>

      <div className="ab-layer">
        <ImageCloud
          images={[
            "/assets/169_401x283.jpg",
            "/assets/170_356x201.jpg",
            "/assets/171_339x225.jpg",
            "/assets/172_393x292.jpg",
            "/assets/173_475x314.jpg",
            "/assets/174_600x382.jpg",
            "/assets/175_579x386.jpg",
            "/assets/176_634x430.jpg",
            "/assets/177_142x180.jpg",
            "/assets/178_636x478.jpg",
            "/assets/179_402x226.jpg",
            "/assets/180_255x145.jpg",
            "/assets/181_259x209.jpg",
            "/assets/182_341x228.jpg",
            "/assets/183_471x352.jpg",
            "/assets/184_346x195.jpg",
            "/assets/185_165x243.jpg",
            "/assets/186_313x199.jpg",
            "/assets/187_439x302.jpg",
            "/assets/188_270x156.jpg",
            "/assets/189_318x178.jpg",
            "/assets/190_479x261.jpg",
            "/assets/191_426x202.jpg",
          ]}
        />
        <div className="ab-abs-center upper">
          <div className="ab-abs-center">
            <div className="ab-persp" data-r="gMain">
              <img className="ab-g-main" src="/assets/168_903x600.jpg" alt="" />
            </div>
          </div>
          <GridHeadline left="Film + Series" right="Games + Concerts" />
        </div>
      </div>

      <div className="ab-layer ab-socials upper c-off" data-r="socials">
        <p className="rel t14 ab-soc-hollow" data-r="socHollow">
          <span className="c-off20">For</span>
          <span className="abs tl wfull flex">
            <Letters text="For" hook="data-sh" />
          </span>
        </p>
        <h4 className="t24 ab-soc-title" data-r="socTitle">
          News +<br />
          Releases
        </h4>
        <p className="t14" data-r="socMid">
          <span className="ab-soc-mid">Follow</span>
          <span className="ab-soc-mid">Aren</span>
        </p>
        <SocialLink first>On</SocialLink>
        <SocialLink href="https://bandcamp.com/">Bandcamp</SocialLink>
        <SocialLink>Or</SocialLink>
        <SocialLink href="https://www.instagram.com/">Instagram</SocialLink>
      </div>
    </div>
  );
}
