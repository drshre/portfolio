"use client";

import { useEffect } from "react";
import caseStudies from "./case-studies.json";

// Order matters: each library expects the global THREE (and the ones before it) to exist.
const SCRIPTS = [
  "/lib/three.min.js",
  "/lib/OrbitControls.js",
  "/lib/RoundedBoxGeometry.js",
  "/lib/RoomEnvironment.js",
  "/lib/GLTFLoader.js",
  "/lib/meshopt_decoder.js",
  "/content.js?v=14", // projects + page templates, shared with the list view; bump v when you edit it
  "/scene.js?v=13",
];

function load(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s);
  });
}

// Size the meadow to the part of the screen the browser actually shows. Mobile Safari (iOS 26 especially)
// can report 100svh taller than the visible area, which pushes the bottom project pills under its toolbar.
function fitToVisibleArea() {
  const vv = window.visualViewport;
  const heights = [window.innerHeight, document.documentElement.clientHeight];
  // ignore the visual viewport while pinch-zoomed, or the scene would shrink with the zoom
  if (vv && Math.abs(vv.scale - 1) < 0.01) heights.push(vv.height);
  const h = Math.round(Math.min(...heights.filter((n) => n > 0)));
  if (h > 0) document.documentElement.style.setProperty("--app-h", h + "px");
}

export default function SceneLoader() {
  useEffect(() => {
    fitToVisibleArea();
    const vv = window.visualViewport;
    window.addEventListener("resize", fitToVisibleArea);
    window.addEventListener("orientationchange", fitToVisibleArea);
    vv?.addEventListener("resize", fitToVisibleArea);
    // iOS settles its toolbar a beat after load; measure again once it has
    const t = window.setTimeout(fitToVisibleArea, 400);
    return () => {
      window.removeEventListener("resize", fitToVisibleArea);
      window.removeEventListener("orientationchange", fitToVisibleArea);
      vv?.removeEventListener("resize", fitToVisibleArea);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const w = window as unknown as { __sceneBooted?: boolean };
    if (w.__sceneBooted) return; // guards React strict-mode double effects in dev
    w.__sceneBooted = true;
    // The project pages read their copy from here (see the case-study merge near the top of public/scene.js).
    (window as unknown as { __CASE_STUDIES?: unknown }).__CASE_STUDIES = caseStudies;
    (async () => {
      for (const src of SCRIPTS) await load(src);
    })().catch((err) => {
      console.error(err);
      const el = document.getElementById("loading");
      if (el) el.innerHTML = 'The 3D scene couldn\'t load. <a href="/list">See the list view</a> or try refreshing.';
    });
  }, []);
  return null;
}
