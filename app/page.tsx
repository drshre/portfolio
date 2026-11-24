import { preload } from "react-dom";
import { markup } from "./markup";
import SceneLoader from "./scene-loader";

// Keep in sync with the ids + MODEL_VERSION in public/scene.js so the preloads are reused.
// These live here (not in the layout) so the list view at /list never downloads the 3D scene.
const MODELS = ["outlandish", "allora", "starling", "estimator", "stash", "nella", "annie"];
const MODEL_VERSION = "1";

export default function Home() {
  // Start the model downloads right away, in parallel with the three.js scripts
  preload("/lib/three.min.js", { as: "script" });
  for (const id of MODELS) preload(`/models/${id}.glb?v=${MODEL_VERSION}`, { as: "fetch", crossOrigin: "anonymous" });
  return (
    <>
      {/* display: contents keeps the original body grid layout intact */}
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: markup }} />
      <SceneLoader />
    </>
  );
}
