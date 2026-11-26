"use client";

import { useEffect } from "react";
import caseStudies from "../case-studies.json";

// Only the shared content and the list router: no three.js, no models.
// Bump CONTENT_VERSION when you edit public/content.js or public/list.js so browsers fetch the new copy.
const CONTENT_VERSION = "15";
const SCRIPTS = [`/content.js?v=${CONTENT_VERSION}`, `/list.js?v=${CONTENT_VERSION}`];

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

export default function ListLoader() {
  useEffect(() => {
    const w = window as unknown as { __listBooted?: boolean; __CASE_STUDIES?: unknown };
    if (w.__listBooted) return; // guards React strict-mode double effects in dev
    w.__listBooted = true;
    w.__CASE_STUDIES = caseStudies;
    (async () => {
      for (const src of SCRIPTS) await load(src);
    })().catch((err) => console.error(err));
  }, []);
  return null;
}
