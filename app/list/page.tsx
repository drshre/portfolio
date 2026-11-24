import type { Metadata } from "next";
import ListLoader from "./list-loader";

export const metadata: Metadata = {
  title: "Shreyas Parat, Design Engineer",
  description:
    "Design engineer in Los Angeles. Mechanical engineer turned product builder: GM patents, shipped iOS apps, and tools for Toyota, Fender and more.",
};

// The list view: the same about and project pages as the meadow, with no 3D scene.
// public/list.js renders into #sh-body from the shared content in public/content.js.
export default function ListPage() {
  return (
    <>
      <main className="sheet is-open lv" id="sheet" aria-label="Shreyas Parat" tabIndex={-1}>
        <div className="sh-bar">
          <span style={{ flex: 1 }} />
          <a className="sign r lv-3d" id="lv-3d" href="/">
            <span>Explore in 3D</span>
          </a>
        </div>
        <div className="sh-body" id="sh-body" />
      </main>
      <ListLoader />
    </>
  );
}
