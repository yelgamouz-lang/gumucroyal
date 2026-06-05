"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const POSTER_SRC = "/videos/hero-poster.jpg";
const DESKTOP_MP4 = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "/videos/hero.mp4";
const MOBILE_MP4 = process.env.NEXT_PUBLIC_HERO_MOBILE_VIDEO_URL || "/videos/hero-mobile.mp4";
const MOBILE_MQ = "(max-width: 767px)";

export function HeroVideoBackground() {
  const desktopRef = useRef<HTMLVideoElement>(null);
  const mobileRef = useRef<HTMLVideoElement>(null);
  const playRequested = useRef(false);
  const [posterVisible, setPosterVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const revealVideo = useCallback(() => {
    setPosterVisible(false);
  }, []);

  const tryPlay = useCallback(
    (video: HTMLVideoElement | null) => {
      if (!video) return;

      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");

      const playPromise = video.play();
      if (!playPromise) return;

      playPromise
        .then(() => {
          revealVideo();
        })
        .catch(() => {
          if (video.readyState >= 2) revealVideo();
        });
    },
    [revealVideo]
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const syncViewport = () => setIsMobile(mq.matches);
    syncViewport();
    mq.addEventListener("change", syncViewport);
    return () => mq.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    const video = isMobile ? mobileRef.current : desktopRef.current;
    const inactive = isMobile ? desktopRef.current : mobileRef.current;

    inactive?.pause();

    if (!video) return undefined;

    playRequested.current = false;
    const cleanups: Array<() => void> = [];

    const addCleanup = (fn: () => void) => {
      cleanups.push(fn);
    };

    const requestPlayOnce = () => {
      if (playRequested.current) return;
      playRequested.current = true;
      revealVideo();
      tryPlay(video);
    };

    if (isMobile) {
      const onCanPlay = () => requestPlayOnce();

      video.addEventListener("canplay", onCanPlay, { once: true });
      addCleanup(() => video.removeEventListener("canplay", onCanPlay));

      if (video.readyState >= 2) {
        requestPlayOnce();
      } else {
        video.load();
      }

      const onVisibility = () => {
        if (document.visibilityState === "visible" && video.paused) {
          playRequested.current = false;
          tryPlay(video);
        }
      };

      document.addEventListener("visibilitychange", onVisibility);
      addCleanup(() => document.removeEventListener("visibilitychange", onVisibility));
    } else {
      const onLoaded = () => {
        revealVideo();
        tryPlay(video);
      };

      const onPlaying = () => {
        revealVideo();
      };

      const onCanPlayDesktop = () => tryPlay(video);

      video.addEventListener("loadeddata", onLoaded);
      video.addEventListener("canplay", onCanPlayDesktop);
      video.addEventListener("playing", onPlaying);
      addCleanup(() => video.removeEventListener("loadeddata", onLoaded));
      addCleanup(() => video.removeEventListener("canplay", onCanPlayDesktop));
      addCleanup(() => video.removeEventListener("playing", onPlaying));

      video.load();

      if (video.readyState >= 2) {
        onLoaded();
      } else {
        tryPlay(video);
      }

      const onVisibility = () => {
        if (document.visibilityState === "visible") {
          tryPlay(video);
        }
      };

      const onPageShow = () => {
        tryPlay(video);
      };

      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("pageshow", onPageShow);
      addCleanup(() => document.removeEventListener("visibilitychange", onVisibility));
      addCleanup(() => window.removeEventListener("pageshow", onPageShow));
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [isMobile, revealVideo, tryPlay]);

  const sharedVideoProps = {
    style: { pointerEvents: "none" as const },
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    poster: POSTER_SRC,
    disablePictureInPicture: true,
    disableRemotePlayback: true,
  };

  return (
    <div className="hero-video-shell absolute inset-0 z-0 overflow-hidden bg-brand-black" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={POSTER_SRC}
        alt=""
        fetchPriority="high"
        decoding="async"
        className={`hero-video-poster transition-opacity duration-200 ${
          posterVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <video
        ref={desktopRef}
        className="hero-video-element hero-video-element--desktop"
        preload={isMobile ? "none" : "auto"}
        {...sharedVideoProps}
      >
        <source src={DESKTOP_MP4} type="video/mp4" />
      </video>

      <video
        ref={mobileRef}
        className="hero-video-element hero-video-element--mobile"
        preload={isMobile ? "auto" : "none"}
        {...sharedVideoProps}
      >
        <source src={MOBILE_MP4} type="video/mp4" />
      </video>

      <div className="hero-video-overlay pointer-events-none" />
    </div>
  );
}
