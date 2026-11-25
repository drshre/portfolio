/* List view (/list): the about page with a signpost to every project, and the same project pages as the meadow.
   No three.js. Routes on the hash, like the meadow: /list#outlandish opens a project, /list is the about page. */
(function () {
  const S = window.SITE;
  const sheet = document.getElementById("sheet"), body = document.getElementById("sh-body");
  const to3d = document.getElementById("lv-3d");
  const BASE_TITLE = document.title;
  let current = null, aboutScroll = 0;

  function route(first) {
    const id = decodeURIComponent(location.hash.slice(1));
    const p = S.PROJECTS.find(x => x.id === id) || null;
    if (current === null && !first) aboutScroll = sheet.scrollTop; // leaving the about page: remember where the signpost was
    current = p;
    if (p) {
      body.innerHTML = S.sheetHTML(p);
      if (p.id === "allora") S.wireAlloraSketch();
      S.wireDots();
      to3d.style.display = "none"; // the 3D switch lives on the list home only
      document.title = p.name + " · " + BASE_TITLE;
      sheet.scrollTop = 0;
      S.unfoldBento(body);
    } else {
      body.innerHTML = S.aboutHTML({ signpost: true });
      S.wireAbout();
      to3d.style.display = "";
      document.title = BASE_TITLE;
      sheet.scrollTop = first ? 0 : aboutScroll;
    }
    if (!first) sheet.focus({ preventScroll: true });
  }

  function toAbout() {
    history.pushState("", document.title, location.pathname + location.search);
    route(false);
  }
  addEventListener("hashchange", () => route(false));
  addEventListener("popstate", () => { if (!location.hash) route(false); });
  addEventListener("keydown", e => {
    if (e.key === "Escape" && current && !(e.metaKey || e.ctrlKey || e.altKey)) { e.preventDefault(); toAbout(); }
  });
  route(true);
})();
