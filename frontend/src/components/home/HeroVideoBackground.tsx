"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { HERO_DESKTOP_MP4, HERO_MOBILE_MP4, HERO_POSTER } from "@/lib/heroMedia";

const POSTER_SRC = HERO_POSTER;
const DESKTOP_MP4 = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || HERO_DESKTOP_MP4;
const MOBILE_MP4 = process.env.NEXT_PUBLIC_HERO_MOBILE_VIDEO_URL || HERO_MOBILE_MP4;
const MOBILE_MQ = "(max-width: 767px)";
const REDUCED_MOTION_MQ = "(prefers-reduced-motion: reduce)";

function subscribeMobileMq(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMobileMqSnapshot() {
  return window.matchMedia(MOBILE_MQ).matches;
}

function getMobileMqServerSnapshot() {
  return false;
}

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_MQ).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function HeroVideoBackground() {
  const desktopRef = useRef<HTMLVideoElement>(null);
  const mobileRef = useRef<HTMLVideoElement>(null);
  const playRequested = useRef(false);
  const [posterVisible, setPosterVisible] = useState(true);
  const isMobile = useSyncExternalStore(subscribeMobileMq, getMobileMqSnapshot, getMobileMqServerSnapshot);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

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
    const video = isMobile ? mobileRef.current : desktopRef.current;
    const inactive = isMobile ? desktopRef.current : mobileRef.current;

    inactive?.pause();

    // Respect reduced-motion: do not autoplay, keep the static poster.
    if (prefersReducedMotion) {
      desktopRef.current?.pause();
      mobileRef.current?.pause();
      setPosterVisible(true);
      return undefined;
    }

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
  }, [isMobile, prefersReducedMotion, revealVideo, tryPlay]);

  const sharedVideoProps = {
    style: { pointerEvents: "none" as const },
    autoPlay: !prefersReducedMotion,
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
        preload={isMobile ? "metadata" : "none"}
        {...sharedVideoProps}
      >
        <source src={MOBILE_MP4} type="video/mp4" />
      </video>

      <div className="hero-video-overlay pointer-events-none" />
    </div>
  );
}
