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
  "/content.js?v=10", // projects + page templates, shared with the list view; bump v when you edit it
  "/scene.js",
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

export default function SceneLoader() {
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
